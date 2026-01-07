#!/usr/bin/env python3
"""
Compose lyric video using FFmpeg.

Combines audio, background video clips, and subtitle overlays into final video.

Usage:
    python compose.py --audio track.mp3 --background clips/ --subtitles track.srt --output output.mp4

Requirements:
    - FFmpeg must be installed and in PATH
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


def check_ffmpeg():
    """Verify FFmpeg is installed."""
    try:
        result = subprocess.run(['ffmpeg', '-version'],
                               capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except (subprocess.SubprocessError, FileNotFoundError):
        return False


def get_video_duration(video_path: str) -> float:
    """Get duration of video file in seconds."""
    cmd = [
        'ffprobe', '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        video_path
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return float(result.stdout.strip())
    except (subprocess.SubprocessError, ValueError):
        return 0


def get_audio_duration(audio_path: str) -> float:
    """Get duration of audio file in seconds."""
    return get_video_duration(audio_path)  # Same ffprobe command works


def create_background_concat(clips_dir: str, target_duration: float, output_path: str) -> str:
    """
    Create a concatenated background video from clips.

    Loops clips as needed to match target duration.
    """
    clips_path = Path(clips_dir)

    # Find all video files
    video_extensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    clips = []
    for ext in video_extensions:
        clips.extend(clips_path.glob(f'*{ext}'))

    if not clips:
        print(f"ERROR: No video clips found in {clips_dir}")
        return None

    clips = sorted(clips)
    print(f"Found {len(clips)} video clips")

    # Calculate total duration of clips
    total_clip_duration = 0
    clip_durations = []
    for clip in clips:
        duration = get_video_duration(str(clip))
        clip_durations.append(duration)
        total_clip_duration += duration

    print(f"Total clip duration: {total_clip_duration:.1f}s, target: {target_duration:.1f}s")

    # Create concat file
    concat_file = Path(output_path).parent / "concat_list.txt"
    with open(concat_file, 'w') as f:
        # Repeat clips as needed
        current_duration = 0
        while current_duration < target_duration:
            for clip in clips:
                f.write(f"file '{clip.absolute()}'\n")
                current_duration += get_video_duration(str(clip))
                if current_duration >= target_duration:
                    break

    # Concatenate clips
    concat_output = Path(output_path).parent / "background_concat.mp4"
    cmd = [
        'ffmpeg', '-y',
        '-f', 'concat', '-safe', '0',
        '-i', str(concat_file),
        '-c', 'copy',
        '-t', str(target_duration),
        str(concat_output)
    ]

    print("Concatenating background clips...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR: FFmpeg concat failed: {result.stderr}")
        return None

    # Clean up concat file
    concat_file.unlink()

    return str(concat_output)


def create_lyric_video(
    audio_path: str,
    background_path: str,
    subtitle_path: str,
    output_path: str,
    resolution: tuple = (1920, 1080),
    fps: int = 30
) -> bool:
    """
    Create lyric video with FFmpeg.

    Args:
        audio_path: Path to audio file
        background_path: Path to background video or directory of clips
        subtitle_path: Path to SRT/ASS subtitle file
        output_path: Output video path
        resolution: Output resolution (width, height)
        fps: Output frame rate

    Returns:
        True if successful
    """
    if not check_ffmpeg():
        print("ERROR: FFmpeg not found. Please install FFmpeg.")
        return False

    # Get audio duration
    audio_duration = get_audio_duration(audio_path)
    print(f"Audio duration: {audio_duration:.1f}s")

    # Handle background
    background_video = background_path
    if Path(background_path).is_dir():
        background_video = create_background_concat(background_path, audio_duration, output_path)
        if not background_video:
            return False

    # Build FFmpeg command
    width, height = resolution
    subtitle_ext = Path(subtitle_path).suffix.lower()

    # Escape path for FFmpeg subtitles filter (Windows needs special handling)
    sub_path_escaped = str(Path(subtitle_path).absolute()).replace('\\', '/').replace(':', '\\:')

    if subtitle_ext == '.ass':
        # ASS has built-in styling
        subtitle_filter = f"ass='{sub_path_escaped}'"
    else:
        # SRT - add styling
        subtitle_filter = f"subtitles='{sub_path_escaped}':force_style='FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2,Alignment=2'"

    cmd = [
        'ffmpeg', '-y',
        '-i', background_video,
        '-i', audio_path,
        '-filter_complex', f'[0:v]scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,{subtitle_filter}[v]',
        '-map', '[v]',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-r', str(fps),
        '-t', str(audio_duration),
        '-movflags', '+faststart',
        output_path
    ]

    print(f"Rendering lyric video: {output_path}")
    print(f"Resolution: {width}x{height} @ {fps}fps")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"ERROR: FFmpeg render failed")
        print(result.stderr[-1000:] if len(result.stderr) > 1000 else result.stderr)
        return False

    # Clean up temp files
    if Path(background_path).is_dir():
        concat_output = Path(output_path).parent / "background_concat.mp4"
        if concat_output.exists():
            concat_output.unlink()

    print(f"SUCCESS: Lyric video created: {output_path}")
    return True


def create_vertical_version(input_path: str, output_path: str) -> bool:
    """
    Create 9:16 vertical version for TikTok/Reels/Shorts.
    """
    cmd = [
        'ffmpeg', '-y',
        '-i', input_path,
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
        '-c:a', 'copy',
        output_path
    ]

    print(f"Creating vertical version: {output_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"ERROR: Vertical conversion failed: {result.stderr}")
        return False

    print(f"SUCCESS: Vertical video created: {output_path}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Compose lyric video with FFmpeg")
    parser.add_argument("--audio", "-a", required=True, help="Audio file path")
    parser.add_argument("--background", "-b", required=True,
                       help="Background video file or directory of clips")
    parser.add_argument("--subtitles", "-s", required=True,
                       help="Subtitle file (SRT or ASS)")
    parser.add_argument("--output", "-o", required=True, help="Output video path")
    parser.add_argument("--width", type=int, default=1920, help="Output width")
    parser.add_argument("--height", type=int, default=1080, help="Output height")
    parser.add_argument("--fps", type=int, default=30, help="Output frame rate")
    parser.add_argument("--vertical", action="store_true",
                       help="Also create 9:16 vertical version")

    args = parser.parse_args()

    # Verify inputs exist
    if not Path(args.audio).exists():
        print(f"ERROR: Audio file not found: {args.audio}")
        sys.exit(1)

    if not Path(args.background).exists():
        print(f"ERROR: Background not found: {args.background}")
        sys.exit(1)

    if not Path(args.subtitles).exists():
        print(f"ERROR: Subtitle file not found: {args.subtitles}")
        sys.exit(1)

    # Create output directory
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)

    # Create main video
    success = create_lyric_video(
        args.audio,
        args.background,
        args.subtitles,
        args.output,
        (args.width, args.height),
        args.fps
    )

    if success and args.vertical:
        vertical_output = Path(args.output).stem + "_vertical.mp4"
        vertical_path = Path(args.output).parent / vertical_output
        create_vertical_version(args.output, str(vertical_path))


if __name__ == "__main__":
    main()
