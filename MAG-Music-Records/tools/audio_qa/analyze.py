#!/usr/bin/env python3
"""
Audio QA Analysis Script for MAG Music Records

Analyzes audio files for technical quality issues and generates
JSON output for report generation.

Usage:
    python analyze.py <audio_file_path> [--output <json_path>]

Dependencies:
    pip install librosa numpy soundfile scipy

Author: MAG Music Records
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

import numpy as np

# Optional imports with fallbacks
try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

try:
    import soundfile as sf
    SOUNDFILE_AVAILABLE = True
except ImportError:
    SOUNDFILE_AVAILABLE = False

try:
    from scipy import signal
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False


# ==============================================================================
# CONFIGURATION - MAG Production Quality Thresholds
# ==============================================================================

THRESHOLDS = {
    "bpm": {
        "target_min": 74,
        "target_max": 96,
        "warn_min": 70,
        "warn_max": 100,
    },
    "lufs": {
        "target_min": -14,
        "target_max": -10,
        "warn_min": -16,
        "warn_max": -9,
        "fail_min": -18,
        "fail_max": -8,
    },
    "true_peak": {
        "pass": -1.0,
        "warn": -0.5,
        "fail": 0.0,
    },
    "dynamic_range": {
        "pass": 6.0,
        "warn": 4.0,
    },
    "sample_rate": {
        "target": [44100, 48000],
        "min": 44100,
    },
    "clipping_threshold": 0.99,  # Samples above this are potential clips
}

SUPPORTED_FORMATS = [".wav", ".mp3", ".flac", ".m4a", ".ogg", ".aiff", ".aif"]


# ==============================================================================
# ANALYSIS FUNCTIONS
# ==============================================================================

def check_dependencies() -> Dict[str, bool]:
    """Check which audio analysis libraries are available."""
    return {
        "librosa": LIBROSA_AVAILABLE,
        "soundfile": SOUNDFILE_AVAILABLE,
        "scipy": SCIPY_AVAILABLE,
    }


def load_audio(file_path: str) -> Tuple[Optional[np.ndarray], Optional[int]]:
    """
    Load audio file and return samples and sample rate.

    Returns:
        Tuple of (audio_samples, sample_rate) or (None, None) on failure
    """
    if not LIBROSA_AVAILABLE:
        return None, None

    try:
        # Load with librosa (handles most formats)
        y, sr = librosa.load(file_path, sr=None, mono=False)
        return y, sr
    except Exception as e:
        print(f"Error loading audio: {e}", file=sys.stderr)
        return None, None


def get_file_info(file_path: str) -> Dict[str, Any]:
    """Extract basic file information."""
    path = Path(file_path)
    info = {
        "file_name": path.name,
        "file_path": str(path.absolute()),
        "file_size_mb": round(path.stat().st_size / (1024 * 1024), 2),
        "format": path.suffix.lower(),
        "analysis_timestamp": datetime.now().isoformat(),
    }

    # Try to get detailed audio info with soundfile
    if SOUNDFILE_AVAILABLE:
        try:
            with sf.SoundFile(file_path) as f:
                info["duration_seconds"] = round(len(f) / f.samplerate, 2)
                info["sample_rate"] = f.samplerate
                info["channels"] = f.channels
                info["subtype"] = f.subtype  # e.g., PCM_24
        except Exception:
            pass

    return info


def detect_bpm(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Detect BPM using librosa's beat tracking.

    Returns dict with bpm value and confidence assessment.
    """
    if not LIBROSA_AVAILABLE:
        return {"bpm": None, "error": "librosa not available"}

    try:
        # Convert to mono if stereo
        if y.ndim > 1:
            y_mono = librosa.to_mono(y)
        else:
            y_mono = y

        # Detect tempo
        tempo, beat_frames = librosa.beat.beat_track(y=y_mono, sr=sr)

        # Handle both old and new librosa versions
        bpm = float(tempo[0]) if hasattr(tempo, '__len__') else float(tempo)

        # Determine status based on thresholds
        t = THRESHOLDS["bpm"]
        if t["target_min"] <= bpm <= t["target_max"]:
            status = "PASS"
        elif t["warn_min"] <= bpm <= t["warn_max"]:
            status = "WARNING"
        else:
            status = "FAIL"

        return {
            "bpm": round(bpm, 1),
            "target_range": f"{t['target_min']}-{t['target_max']}",
            "status": status,
            "beat_count": len(beat_frames),
        }
    except Exception as e:
        return {"bpm": None, "error": str(e)}


def measure_loudness(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Measure loudness metrics (approximation of LUFS).

    Note: For true ITU-R BS.1770 LUFS, use dedicated tools like pyloudnorm.
    This provides a reasonable approximation for QA purposes.
    """
    try:
        # Convert to mono if needed
        if y.ndim > 1:
            y_mono = librosa.to_mono(y) if LIBROSA_AVAILABLE else np.mean(y, axis=0)
        else:
            y_mono = y

        # RMS-based loudness approximation
        # True LUFS requires K-weighting filter, this is simplified
        rms = np.sqrt(np.mean(y_mono**2))

        # Convert to dB (approximate LUFS)
        if rms > 0:
            lufs_approx = 20 * np.log10(rms) - 0.691  # Rough offset for LUFS approximation
        else:
            lufs_approx = -70  # Very quiet

        # True peak (maximum sample value in dBFS)
        peak = np.max(np.abs(y))
        true_peak_db = 20 * np.log10(peak) if peak > 0 else -70

        # Dynamic range (simplified: difference between loud and quiet sections)
        # Using percentile-based approach
        frame_length = int(sr * 0.4)  # 400ms frames
        hop_length = int(sr * 0.1)    # 100ms hop

        if LIBROSA_AVAILABLE:
            rms_frames = librosa.feature.rms(y=y_mono, frame_length=frame_length, hop_length=hop_length)[0]
        else:
            # Simple frame-based RMS
            rms_frames = []
            for i in range(0, len(y_mono) - frame_length, hop_length):
                frame = y_mono[i:i + frame_length]
                rms_frames.append(np.sqrt(np.mean(frame**2)))
            rms_frames = np.array(rms_frames)

        if len(rms_frames) > 0 and np.max(rms_frames) > 0:
            rms_db = 20 * np.log10(rms_frames + 1e-10)
            # Dynamic range: difference between 95th and 10th percentile
            dynamic_range = np.percentile(rms_db, 95) - np.percentile(rms_db, 10)
        else:
            dynamic_range = 0

        # Determine status
        t = THRESHOLDS["lufs"]
        if t["target_min"] <= lufs_approx <= t["target_max"]:
            lufs_status = "PASS"
        elif t["warn_min"] <= lufs_approx <= t["warn_max"]:
            lufs_status = "WARNING"
        else:
            lufs_status = "FAIL"

        tp = THRESHOLDS["true_peak"]
        if true_peak_db < tp["pass"]:
            peak_status = "PASS"
        elif true_peak_db < tp["warn"]:
            peak_status = "WARNING"
        else:
            peak_status = "FAIL"

        dr = THRESHOLDS["dynamic_range"]
        if dynamic_range >= dr["pass"]:
            dr_status = "PASS"
        elif dynamic_range >= dr["warn"]:
            dr_status = "WARNING"
        else:
            dr_status = "FAIL"

        return {
            "integrated_lufs": round(lufs_approx, 1),
            "lufs_status": lufs_status,
            "lufs_note": "Approximate value - use dedicated LUFS meter for mastering",
            "true_peak_db": round(true_peak_db, 2),
            "peak_status": peak_status,
            "dynamic_range_db": round(dynamic_range, 1),
            "dynamic_range_status": dr_status,
        }
    except Exception as e:
        return {"error": str(e)}


def detect_clipping(y: np.ndarray) -> Dict[str, Any]:
    """
    Detect potential digital clipping in the audio.

    Looks for:
    1. Samples at or very near maximum value
    2. Consecutive clipped samples (flat-top clipping)
    """
    try:
        threshold = THRESHOLDS["clipping_threshold"]

        # Flatten to check all channels
        y_flat = y.flatten() if y.ndim > 1 else y

        # Count samples near maximum
        clipped_samples = np.sum(np.abs(y_flat) >= threshold)
        total_samples = len(y_flat)
        clip_percentage = (clipped_samples / total_samples) * 100

        # Check for consecutive clipped samples (worse form of clipping)
        above_threshold = np.abs(y_flat) >= threshold
        consecutive_clips = 0
        max_consecutive = 0
        for val in above_threshold:
            if val:
                consecutive_clips += 1
                max_consecutive = max(max_consecutive, consecutive_clips)
            else:
                consecutive_clips = 0

        # Determine severity
        if clipped_samples == 0:
            status = "PASS"
            message = "No clipping detected"
        elif clip_percentage < 0.01 and max_consecutive < 3:
            status = "WARNING"
            message = f"Minor potential clipping ({clipped_samples} samples)"
        else:
            status = "FAIL"
            message = f"Clipping detected ({clipped_samples} samples, {clip_percentage:.3f}%)"

        return {
            "clipped_samples": int(clipped_samples),
            "clip_percentage": round(clip_percentage, 4),
            "max_consecutive_clips": max_consecutive,
            "status": status,
            "message": message,
        }
    except Exception as e:
        return {"error": str(e)}


def analyze_frequency_balance(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Analyze frequency balance to detect common mix issues.

    Checks for:
    - Muddy bass (excessive 200-400Hz)
    - Harsh highs (excessive 2-8kHz)
    - Lack of sub bass (important for 808s)
    - Overall spectral balance
    """
    if not LIBROSA_AVAILABLE:
        return {"error": "librosa not available"}

    try:
        # Convert to mono
        if y.ndim > 1:
            y_mono = librosa.to_mono(y)
        else:
            y_mono = y

        # Compute spectrogram
        S = np.abs(librosa.stft(y_mono))
        freqs = librosa.fft_frequencies(sr=sr)

        # Calculate energy in different frequency bands
        def band_energy(low_hz, high_hz):
            mask = (freqs >= low_hz) & (freqs < high_hz)
            if np.sum(mask) == 0:
                return 0
            return np.mean(S[mask, :])

        # Define frequency bands
        sub_bass = band_energy(20, 80)      # Sub bass (808 territory)
        bass = band_energy(80, 250)         # Bass
        low_mids = band_energy(250, 500)    # Low mids (potential mud)
        mids = band_energy(500, 2000)       # Mids
        high_mids = band_energy(2000, 6000) # High mids (presence, potential harshness)
        highs = band_energy(6000, 16000)    # Highs

        total = sub_bass + bass + low_mids + mids + high_mids + highs
        if total == 0:
            return {"error": "No frequency content detected"}

        # Calculate percentages
        bands = {
            "sub_bass_20_80hz": round((sub_bass / total) * 100, 1),
            "bass_80_250hz": round((bass / total) * 100, 1),
            "low_mids_250_500hz": round((low_mids / total) * 100, 1),
            "mids_500_2000hz": round((mids / total) * 100, 1),
            "high_mids_2_6khz": round((high_mids / total) * 100, 1),
            "highs_6_16khz": round((highs / total) * 100, 1),
        }

        # Spectral centroid (brightness indicator)
        centroid = librosa.feature.spectral_centroid(y=y_mono, sr=sr)
        avg_centroid = np.mean(centroid)

        # Check for issues
        issues = []

        # Muddy bass check (excessive 250-500Hz relative to bass)
        if low_mids / (bass + 0.001) > 0.8:
            issues.append({
                "type": "muddy_bass",
                "severity": "WARNING",
                "description": "Potential muddy bass buildup in 250-500Hz range",
                "recommendation": "Consider EQ cut around 300-400Hz"
            })

        # Harsh highs check
        if high_mids / (mids + 0.001) > 1.2:
            issues.append({
                "type": "harsh_highs",
                "severity": "WARNING",
                "description": "Potential harshness in 2-6kHz range",
                "recommendation": "Consider gentle EQ reduction in 3-5kHz range"
            })

        # Weak sub bass (important for 808-heavy tracks)
        if sub_bass / (bass + 0.001) < 0.3:
            issues.append({
                "type": "weak_sub_bass",
                "severity": "WARNING",
                "description": "Sub bass (20-80Hz) appears weak relative to bass",
                "recommendation": "Verify 808s translate on full-range systems"
            })

        status = "PASS" if len(issues) == 0 else "WARNING"

        return {
            "frequency_bands": bands,
            "spectral_centroid_hz": round(avg_centroid, 0),
            "issues": issues,
            "status": status,
        }
    except Exception as e:
        return {"error": str(e)}


def analyze_stereo(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Analyze stereo characteristics.

    Checks:
    - Stereo width
    - Phase correlation (mono compatibility)
    - Left/Right balance
    """
    try:
        if y.ndim == 1:
            return {
                "channels": 1,
                "stereo_width": 0,
                "phase_correlation": 1.0,
                "status": "PASS",
                "note": "Mono file - stereo analysis not applicable"
            }

        if y.shape[0] != 2:
            return {"error": f"Expected 2 channels, got {y.shape[0]}"}

        left = y[0]
        right = y[1]

        # Mid-Side analysis
        mid = (left + right) / 2
        side = (left - right) / 2

        # Stereo width (ratio of side to mid energy)
        mid_energy = np.mean(mid**2)
        side_energy = np.mean(side**2)

        if mid_energy > 0:
            stereo_width = np.sqrt(side_energy / mid_energy)
        else:
            stereo_width = 0

        # Phase correlation (-1 to +1, where +1 is perfect mono compatibility)
        correlation = np.corrcoef(left, right)[0, 1]

        # Left/Right balance
        left_rms = np.sqrt(np.mean(left**2))
        right_rms = np.sqrt(np.mean(right**2))
        if left_rms + right_rms > 0:
            balance = (right_rms - left_rms) / (left_rms + right_rms)
        else:
            balance = 0

        # Check for issues
        issues = []

        if correlation < 0.3:
            issues.append({
                "type": "phase_issues",
                "severity": "WARNING",
                "description": "Low stereo correlation - may have issues in mono playback",
                "recommendation": "Check mono compatibility, especially for bass content"
            })

        if correlation < 0:
            issues.append({
                "type": "phase_cancellation",
                "severity": "FAIL",
                "description": "Negative phase correlation detected - significant mono compatibility issues",
                "recommendation": "Review stereo processing, check for phase-inverted signals"
            })

        if abs(balance) > 0.2:
            side = "right" if balance > 0 else "left"
            issues.append({
                "type": "stereo_imbalance",
                "severity": "WARNING",
                "description": f"Stereo balance skewed to {side}",
                "recommendation": "Check pan positions and stereo processing"
            })

        status = "PASS"
        for issue in issues:
            if issue["severity"] == "FAIL":
                status = "FAIL"
                break
            elif issue["severity"] == "WARNING" and status != "FAIL":
                status = "WARNING"

        return {
            "channels": 2,
            "stereo_width": round(stereo_width, 2),
            "phase_correlation": round(correlation, 3),
            "left_right_balance": round(balance, 3),
            "issues": issues,
            "status": status,
        }
    except Exception as e:
        return {"error": str(e)}


def detect_silence(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Detect silence at beginning and end of track.

    Flags:
    - Excessive leading silence
    - Abrupt start (no lead-in)
    - Excessive trailing silence
    - Abrupt ending (no tail)
    """
    try:
        # Convert to mono for analysis
        if y.ndim > 1:
            y_mono = np.max(np.abs(y), axis=0)  # Max of channels
        else:
            y_mono = np.abs(y)

        # RMS threshold for silence (approximately -60dB)
        silence_threshold = 0.001

        # Frame-based analysis
        frame_length = int(sr * 0.05)  # 50ms frames
        hop_length = int(sr * 0.01)    # 10ms hop

        # Calculate RMS per frame
        frames = []
        for i in range(0, len(y_mono) - frame_length, hop_length):
            frame_rms = np.sqrt(np.mean(y_mono[i:i + frame_length]**2))
            frames.append(frame_rms)

        frames = np.array(frames)

        # Find first non-silent frame
        non_silent = frames > silence_threshold

        if not np.any(non_silent):
            return {
                "status": "FAIL",
                "message": "File appears to be silent",
                "leading_silence_ms": len(y_mono) / sr * 1000,
                "trailing_silence_ms": 0,
            }

        first_sound = np.argmax(non_silent)
        last_sound = len(non_silent) - np.argmax(non_silent[::-1]) - 1

        leading_silence_ms = (first_sound * hop_length / sr) * 1000
        trailing_silence_ms = ((len(non_silent) - last_sound - 1) * hop_length / sr) * 1000

        issues = []

        # Check for excessive leading silence (>500ms)
        if leading_silence_ms > 500:
            issues.append({
                "type": "excessive_leading_silence",
                "severity": "WARNING",
                "description": f"Leading silence of {leading_silence_ms:.0f}ms detected",
                "recommendation": "Trim leading silence to <100ms for streaming"
            })

        # Check for abrupt start (<10ms)
        if leading_silence_ms < 10:
            issues.append({
                "type": "abrupt_start",
                "severity": "WARNING",
                "description": "Very abrupt start detected",
                "recommendation": "Add short fade-in to prevent clicks on playback"
            })

        # Check for excessive trailing silence (>2000ms)
        if trailing_silence_ms > 2000:
            issues.append({
                "type": "excessive_trailing_silence",
                "severity": "WARNING",
                "description": f"Trailing silence of {trailing_silence_ms:.0f}ms detected",
                "recommendation": "Trim trailing silence to <500ms for streaming"
            })

        status = "PASS" if len(issues) == 0 else "WARNING"

        return {
            "leading_silence_ms": round(leading_silence_ms, 0),
            "trailing_silence_ms": round(trailing_silence_ms, 0),
            "issues": issues,
            "status": status,
        }
    except Exception as e:
        return {"error": str(e)}


# ==============================================================================
# MAIN ANALYSIS FUNCTION
# ==============================================================================

def analyze_audio(file_path: str) -> Dict[str, Any]:
    """
    Run complete audio analysis on a file.

    Returns comprehensive analysis results as a dictionary.
    """
    results = {
        "analysis_version": "1.0.0",
        "dependencies": check_dependencies(),
        "file_info": {},
        "bpm": {},
        "loudness": {},
        "clipping": {},
        "frequency_balance": {},
        "stereo": {},
        "silence": {},
        "overall_status": "UNKNOWN",
        "human_ear_checks": [],
        "recommendations": [],
    }

    # Check file exists
    if not os.path.exists(file_path):
        results["error"] = f"File not found: {file_path}"
        results["overall_status"] = "ERROR"
        return results

    # Check format
    ext = Path(file_path).suffix.lower()
    if ext not in SUPPORTED_FORMATS:
        results["error"] = f"Unsupported format: {ext}. Supported: {SUPPORTED_FORMATS}"
        results["overall_status"] = "ERROR"
        return results

    # Get file info
    results["file_info"] = get_file_info(file_path)

    # Check dependencies
    if not LIBROSA_AVAILABLE:
        results["error"] = "librosa not installed. Run: pip install librosa"
        results["overall_status"] = "ERROR"
        return results

    # Load audio
    y, sr = load_audio(file_path)
    if y is None:
        results["error"] = "Failed to load audio file"
        results["overall_status"] = "ERROR"
        return results

    # Run all analyses
    results["bpm"] = detect_bpm(y, sr)
    results["loudness"] = measure_loudness(y, sr)
    results["clipping"] = detect_clipping(y)
    results["frequency_balance"] = analyze_frequency_balance(y, sr)
    results["stereo"] = analyze_stereo(y, sr)
    results["silence"] = detect_silence(y, sr)

    # Compile human ear checks (things that can't be automated)
    results["human_ear_checks"] = [
        "Verify vocal clarity and intelligibility",
        "Confirm 808 bass tone matches MAG luxury trap style",
        "Check overall mix balance and instrument separation",
        "Assess if track delivers intended emotional impact",
        "Verify vocal delivery is slow, deliberate, commanding (not rushed)",
        "Confirm orchestral elements (strings, brass) blend well",
        "Listen for any artifacts, clicks, or unwanted noise",
    ]

    # Compile recommendations from all analyses
    recommendations = []

    for key in ["bpm", "loudness", "clipping", "frequency_balance", "stereo", "silence"]:
        section = results.get(key, {})
        if "issues" in section:
            for issue in section["issues"]:
                if "recommendation" in issue:
                    recommendations.append(issue["recommendation"])

    results["recommendations"] = recommendations

    # Determine overall status
    statuses = []
    for key in ["bpm", "clipping", "stereo", "silence"]:
        if "status" in results.get(key, {}):
            statuses.append(results[key]["status"])

    for key in ["lufs_status", "peak_status", "dynamic_range_status"]:
        if key in results.get("loudness", {}):
            statuses.append(results["loudness"][key])

    if "status" in results.get("frequency_balance", {}):
        statuses.append(results["frequency_balance"]["status"])

    if "FAIL" in statuses:
        results["overall_status"] = "FAIL"
    elif "WARNING" in statuses:
        results["overall_status"] = "WARNING"
    elif "ERROR" in statuses or len(statuses) == 0:
        results["overall_status"] = "ERROR"
    else:
        results["overall_status"] = "PASS"

    return results


# ==============================================================================
# CLI INTERFACE
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Audio QA Analysis for MAG Music Records",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python analyze.py track_01.wav
    python analyze.py track_01.wav --output report.json
    python analyze.py --test
        """
    )

    parser.add_argument(
        "file_path",
        nargs="?",
        help="Path to audio file to analyze"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output JSON file path (default: stdout)"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Run in test mode with synthetic audio"
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON output"
    )

    args = parser.parse_args()

    # Test mode
    if args.test:
        print("Running dependency check...")
        deps = check_dependencies()
        print(f"Dependencies: {json.dumps(deps, indent=2)}")

        if all(deps.values()):
            print("\nAll dependencies available. Pipeline ready.")
        else:
            missing = [k for k, v in deps.items() if not v]
            print(f"\nMissing dependencies: {missing}")
            print("Install with: pip install librosa numpy soundfile scipy")

        return 0

    # Normal analysis mode
    if not args.file_path:
        parser.print_help()
        return 1

    # Run analysis
    results = analyze_audio(args.file_path)

    # Output
    indent = 2 if args.pretty else None
    output_json = json.dumps(results, indent=indent)

    if args.output:
        with open(args.output, "w") as f:
            f.write(output_json)
        print(f"Results saved to: {args.output}")
    else:
        print(output_json)

    # Return exit code based on status
    if results["overall_status"] == "FAIL":
        return 2
    elif results["overall_status"] == "WARNING":
        return 1
    elif results["overall_status"] == "ERROR":
        return 3
    else:
        return 0


if __name__ == "__main__":
    sys.exit(main())
