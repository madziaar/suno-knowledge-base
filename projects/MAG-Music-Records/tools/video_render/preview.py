#!/usr/bin/env python3
"""
Generate quick preview of lyric video (lower quality, faster render).

Usage:
    python preview.py --audio track.mp3 --subtitles track.srt --output preview.mp4
"""

import argparse
import subprocess
import sys
from pathlib import Path


def create_color_background_preview(
    audio_path: str,
    subtitle_path: str,
    output_path: str,
    background_color: str = "0x1a1a2e",
    resolution: tuple = (1280, 720)
) -> bool:
    """
    Create quick preview with solid color background.

    Much faster than full video - good for checking subtitle timing.
    """
    width, height = resolution
    audio_duration_cmd = [
        'ffprobe', '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        audio_path
    ]
    result = subprocess.run(audio_duration_cmd, capture_output=True, text=True)
    duration = float(result.stdout.strip())

    # Escape subtitle path for FFmpeg
    sub_path_escaped = str(Path(subtitle_path).absolute()).replace('\\', '/').replace(':', '\\:')
    subtitle_ext = Path(subtitle_path).suffix.lower()

    if subtitle_ext == '.ass':
        subtitle_filter = f"ass='{sub_path_escaped}'"
    else:
        subtitle_filter = f"subtitles='{sub_path_escaped}':force_style='FontSize=28,PrimaryColour=&H00FFFF00&,OutlineColour=&H00000000&,Outline=2'"

    cmd = [
        'ffmpeg', '-y',
        '-f', 'lavfi',
        '-i', f'color=c={background_color}:s={width}x{height}:d={duration}',
        '-i', audio_path,
        '-vf', subtitle_filter,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest',
        output_path
    ]

    print(f"Creating preview: {output_path}")
    print(f"Resolution: {width}x{height} (preview quality)")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"ERROR: Preview render failed")
        print(result.stderr[-500:] if len(result.stderr) > 500 else result.stderr)
        return False

    print(f"SUCCESS: Preview created: {output_path}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Generate quick lyric video preview")
    parser.add_argument("--audio", "-a", required=True, help="Audio file")
    parser.add_argument("--subtitles", "-s", required=True, help="Subtitle file (SRT/ASS)")
    parser.add_argument("--output", "-o", required=True, help="Output preview video")
    parser.add_argument("--color", default="0x1a1a2e",
                       help="Background color (hex, default: dark blue)")
    parser.add_argument("--width", type=int, default=1280, help="Preview width")
    parser.add_argument("--height", type=int, default=720, help="Preview height")

    args = parser.parse_args()

    if not Path(args.audio).exists():
        print(f"ERROR: Audio not found: {args.audio}")
        sys.exit(1)

    if not Path(args.subtitles).exists():
        print(f"ERROR: Subtitles not found: {args.subtitles}")
        sys.exit(1)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)

    create_color_background_preview(
        args.audio,
        args.subtitles,
        args.output,
        args.color,
        (args.width, args.height)
    )


if __name__ == "__main__":
    main()
