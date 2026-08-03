#!/usr/bin/env python3
"""
Convert between LRC, SRT, and ASS subtitle formats.

Usage:
    python convert.py --input track.lrc --formats srt,ass
"""

import argparse
import re
import sys
from pathlib import Path


def parse_lrc(lrc_path: str) -> list[dict]:
    """Parse LRC file to list of timed lines."""
    lines = []

    with open(lrc_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # Match timestamp [mm:ss.xx] or [mm:ss:xx]
            match = re.match(r'\[(\d+):(\d+)[.:](\d+)\](.+)', line)
            if match:
                minutes = int(match.group(1))
                seconds = int(match.group(2))
                centiseconds = int(match.group(3))
                text = match.group(4).strip()

                # Convert to total seconds
                total_seconds = minutes * 60 + seconds + centiseconds / 100

                lines.append({
                    'start': total_seconds,
                    'text': text
                })

    # Calculate end times (next line's start, or +3 seconds for last line)
    for i, line in enumerate(lines):
        if i < len(lines) - 1:
            line['end'] = lines[i + 1]['start']
        else:
            line['end'] = line['start'] + 3.0

    return lines


def export_srt(lines: list[dict], output_path: str):
    """Export to SRT format."""
    output = []

    for i, line in enumerate(lines, 1):
        start = format_srt_time(line['start'])
        end = format_srt_time(line['end'])
        output.append(str(i))
        output.append(f"{start} --> {end}")
        output.append(line['text'])
        output.append("")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))

    print(f"Exported SRT: {output_path}")


def export_ass(lines: list[dict], output_path: str, style: str = "karaoke"):
    """
    Export to ASS (Advanced SubStation Alpha) format with styling.

    Styles:
        - karaoke: Yellow highlight, large font
        - minimal: White text, clean look
        - bold: Large white text with black outline
    """
    # ASS header
    header = """[Script Info]
Title: Lyric Video
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
"""

    if style == "karaoke":
        # Yellow text with black outline, centered at bottom
        header += "Style: Default,Arial,72,&H00FFFF00,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,50,50,80,1\n"
    elif style == "minimal":
        # White text, clean
        header += "Style: Default,Arial,60,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,50,50,60,1\n"
    else:  # bold
        # Large white bold text
        header += "Style: Default,Arial,80,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,2,2,50,50,100,1\n"

    header += """
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    events = []
    for line in lines:
        start = format_ass_time(line['start'])
        end = format_ass_time(line['end'])
        text = line['text'].replace('\n', '\\N')
        events.append(f"Dialogue: 0,{start},{end},Default,,0,0,0,,{text}")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(header)
        f.write('\n'.join(events))

    print(f"Exported ASS: {output_path}")


def format_srt_time(seconds: float) -> str:
    """Format seconds as SRT timestamp: HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def format_ass_time(seconds: float) -> str:
    """Format seconds as ASS timestamp: H:MM:SS.cc"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centiseconds = int((seconds % 1) * 100)
    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"


def main():
    parser = argparse.ArgumentParser(description="Convert between subtitle formats")
    parser.add_argument("--input", "-i", required=True, help="Input LRC file")
    parser.add_argument("--formats", "-f", default="srt,ass", help="Output formats (comma-separated)")
    parser.add_argument("--style", default="karaoke", choices=["karaoke", "minimal", "bold"],
                       help="ASS style preset")

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"ERROR: Input file not found: {input_path}")
        sys.exit(1)

    # Parse LRC
    print(f"Parsing LRC: {input_path}")
    lines = parse_lrc(str(input_path))
    print(f"  Found {len(lines)} timed lines")

    # Export to requested formats
    formats = [f.strip().lower() for f in args.formats.split(',')]

    for fmt in formats:
        output_path = input_path.with_suffix(f'.{fmt}')

        if fmt == 'srt':
            export_srt(lines, str(output_path))
        elif fmt == 'ass':
            export_ass(lines, str(output_path), args.style)
        else:
            print(f"WARNING: Unknown format '{fmt}', skipping")

    print("\nConversion complete!")


if __name__ == "__main__":
    main()
