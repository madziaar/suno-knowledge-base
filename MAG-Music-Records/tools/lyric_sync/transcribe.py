#!/usr/bin/env python3
"""
Transcribe audio using faster-whisper with word-level timestamps.

Usage:
    python transcribe.py <audio_file> [--model medium] [--output output.json]
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from faster_whisper import WhisperModel
except ImportError:
    print("ERROR: faster-whisper not installed. Run: pip install faster-whisper")
    sys.exit(1)


def transcribe_audio(audio_path: str, model_size: str = "medium", language: str = None) -> dict:
    """
    Transcribe audio and return word-level timestamps.

    Args:
        audio_path: Path to audio file (mp3, wav, etc.)
        model_size: Whisper model size (tiny, base, small, medium, large-v3)
        language: Language code (en, pt, etc.) or None for auto-detect

    Returns:
        Dictionary with segments and word-level timestamps
    """
    print(f"Loading Whisper model: {model_size}")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    print(f"Transcribing: {audio_path}")
    segments, info = model.transcribe(
        audio_path,
        language=language,
        word_timestamps=True,
        vad_filter=True
    )

    result = {
        "language": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration,
        "segments": []
    }

    for segment in segments:
        seg_data = {
            "start": segment.start,
            "end": segment.end,
            "text": segment.text.strip(),
            "words": []
        }

        if segment.words:
            for word in segment.words:
                seg_data["words"].append({
                    "word": word.word,
                    "start": word.start,
                    "end": word.end,
                    "probability": word.probability
                })

        result["segments"].append(seg_data)
        print(f"  [{segment.start:.2f}s - {segment.end:.2f}s] {segment.text.strip()}")

    return result


def export_json(transcription: dict, output_path: str):
    """Export transcription to JSON format."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(transcription, f, indent=2, ensure_ascii=False)
    print(f"Saved transcription to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio with word-level timestamps")
    parser.add_argument("audio", help="Path to audio file")
    parser.add_argument("--model", default="medium",
                       choices=["tiny", "base", "small", "medium", "large-v3"],
                       help="Whisper model size (default: medium)")
    parser.add_argument("--language", default=None,
                       help="Language code (en, pt, etc.) or auto-detect if not specified")
    parser.add_argument("--output", "-o", default=None,
                       help="Output JSON file path")

    args = parser.parse_args()

    audio_path = Path(args.audio)
    if not audio_path.exists():
        print(f"ERROR: Audio file not found: {audio_path}")
        sys.exit(1)

    # Default output path
    if args.output is None:
        output_path = audio_path.with_suffix('.whisper.json')
    else:
        output_path = Path(args.output)

    # Transcribe
    transcription = transcribe_audio(str(audio_path), args.model, args.language)

    # Export
    export_json(transcription, str(output_path))

    print(f"\nTranscription complete!")
    print(f"  Duration: {transcription['duration']:.2f}s")
    print(f"  Language: {transcription['language']} ({transcription['language_probability']:.2%})")
    print(f"  Segments: {len(transcription['segments'])}")


if __name__ == "__main__":
    main()
