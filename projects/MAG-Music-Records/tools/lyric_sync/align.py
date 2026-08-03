#!/usr/bin/env python3
"""
Align Whisper transcription with source lyrics file.

Uses fuzzy matching to correct Whisper's output with the actual lyrics,
then applies Whisper's timestamps to create accurate LRC files.

Usage:
    python align.py --whisper transcription.json --lyrics lyrics.txt --output track.lrc
"""

import argparse
import json
import re
import sys
from pathlib import Path

try:
    from Levenshtein import ratio as levenshtein_ratio
except ImportError:
    print("WARNING: python-Levenshtein not installed, using basic matching")
    def levenshtein_ratio(s1, s2):
        # Simple fallback - exact match only
        return 1.0 if s1.lower() == s2.lower() else 0.0


def load_source_lyrics(lyrics_path: str) -> list[dict]:
    """
    Parse lyrics file, extract lines ignoring section markers.

    Returns list of dicts with 'text' and 'section' keys.
    """
    lines = []
    current_section = "Unknown"

    with open(lyrics_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # Check for section marker [Verse 1], [Chorus], etc.
            section_match = re.match(r'^\[([^\]]+)\]$', line)
            if section_match:
                current_section = section_match.group(1)
                continue

            lines.append({
                'text': line,
                'section': current_section
            })

    return lines


def load_whisper_transcription(whisper_path: str) -> dict:
    """Load Whisper JSON transcription."""
    with open(whisper_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    # Lowercase, remove punctuation, normalize whitespace
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = ' '.join(text.split())
    return text


def align_transcription(whisper_data: dict, source_lyrics: list[dict], threshold: float = 0.6) -> list[dict]:
    """
    Align whisper output with source lyrics using fuzzy matching.

    Args:
        whisper_data: Whisper transcription dict
        source_lyrics: List of source lyric lines
        threshold: Minimum similarity ratio to consider a match

    Returns:
        List of aligned lyrics with timestamps
    """
    aligned = []
    whisper_segments = whisper_data.get('segments', [])

    # Build a flat list of whisper lines
    whisper_lines = []
    for seg in whisper_segments:
        whisper_lines.append({
            'text': seg['text'].strip(),
            'start': seg['start'],
            'end': seg['end'],
            'words': seg.get('words', [])
        })

    # For each source lyric, find best matching whisper segment
    used_whisper_indices = set()

    for lyric in source_lyrics:
        source_norm = normalize_text(lyric['text'])
        best_match = None
        best_score = 0
        best_idx = -1

        for i, whisper in enumerate(whisper_lines):
            if i in used_whisper_indices:
                continue

            whisper_norm = normalize_text(whisper['text'])
            score = levenshtein_ratio(source_norm, whisper_norm)

            if score > best_score:
                best_score = score
                best_match = whisper
                best_idx = i

        if best_score >= threshold and best_match:
            aligned.append({
                'text': lyric['text'],  # Use source text (correct spelling)
                'section': lyric['section'],
                'start': best_match['start'],
                'end': best_match['end'],
                'confidence': best_score,
                'whisper_text': best_match['text']
            })
            used_whisper_indices.add(best_idx)
        else:
            # No good match - estimate timing
            aligned.append({
                'text': lyric['text'],
                'section': lyric['section'],
                'start': None,
                'end': None,
                'confidence': 0,
                'whisper_text': None
            })

    # Fill in missing timestamps by interpolation
    aligned = interpolate_missing_timestamps(aligned, whisper_data.get('duration', 0))

    return aligned


def interpolate_missing_timestamps(aligned: list[dict], total_duration: float) -> list[dict]:
    """Fill in missing timestamps by interpolation."""
    # Find gaps and interpolate
    for i, item in enumerate(aligned):
        if item['start'] is None:
            # Find previous and next valid timestamps
            prev_end = 0
            next_start = total_duration

            for j in range(i - 1, -1, -1):
                if aligned[j]['end'] is not None:
                    prev_end = aligned[j]['end']
                    break

            for j in range(i + 1, len(aligned)):
                if aligned[j]['start'] is not None:
                    next_start = aligned[j]['start']
                    break

            # Count how many items need interpolation in this gap
            gap_count = 1
            for j in range(i + 1, len(aligned)):
                if aligned[j]['start'] is None:
                    gap_count += 1
                else:
                    break

            # Distribute time evenly
            gap_duration = next_start - prev_end
            item_duration = gap_duration / gap_count
            item['start'] = prev_end
            item['end'] = prev_end + item_duration

    return aligned


def export_lrc(aligned_data: list[dict], output_path: str, title: str = None, artist: str = None):
    """Export to LRC format."""
    lines = []

    # LRC header
    if title:
        lines.append(f"[ti:{title}]")
    if artist:
        lines.append(f"[ar:{artist}]")
    lines.append("")

    for item in aligned_data:
        if item['start'] is not None:
            # Convert seconds to mm:ss.xx format
            minutes = int(item['start'] // 60)
            seconds = item['start'] % 60
            timestamp = f"[{minutes:02d}:{seconds:05.2f}]"
            lines.append(f"{timestamp}{item['text']}")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"Saved LRC to: {output_path}")


def export_srt(aligned_data: list[dict], output_path: str):
    """Export to SRT format."""
    lines = []

    for i, item in enumerate(aligned_data, 1):
        if item['start'] is not None and item['end'] is not None:
            start = format_srt_time(item['start'])
            end = format_srt_time(item['end'])
            lines.append(str(i))
            lines.append(f"{start} --> {end}")
            lines.append(item['text'])
            lines.append("")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"Saved SRT to: {output_path}")


def format_srt_time(seconds: float) -> str:
    """Format seconds as SRT timestamp: HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def main():
    parser = argparse.ArgumentParser(description="Align Whisper transcription with source lyrics")
    parser.add_argument("--whisper", "-w", required=True, help="Whisper JSON transcription file")
    parser.add_argument("--lyrics", "-l", required=True, help="Source lyrics file")
    parser.add_argument("--output", "-o", required=True, help="Output LRC file")
    parser.add_argument("--srt", action="store_true", help="Also export SRT format")
    parser.add_argument("--title", default=None, help="Song title for LRC header")
    parser.add_argument("--artist", default=None, help="Artist name for LRC header")
    parser.add_argument("--threshold", type=float, default=0.6, help="Match threshold (0-1)")

    args = parser.parse_args()

    # Load files
    print(f"Loading Whisper transcription: {args.whisper}")
    whisper_data = load_whisper_transcription(args.whisper)

    print(f"Loading source lyrics: {args.lyrics}")
    source_lyrics = load_source_lyrics(args.lyrics)
    print(f"  Found {len(source_lyrics)} lyric lines")

    # Align
    print("Aligning transcription with source lyrics...")
    aligned = align_transcription(whisper_data, source_lyrics, args.threshold)

    # Report alignment quality
    matched = sum(1 for a in aligned if a['confidence'] >= args.threshold)
    print(f"  Matched: {matched}/{len(aligned)} lines ({matched/len(aligned)*100:.1f}%)")

    # Export LRC
    export_lrc(aligned, args.output, args.title, args.artist)

    # Optionally export SRT
    if args.srt:
        srt_path = Path(args.output).with_suffix('.srt')
        export_srt(aligned, str(srt_path))

    print("\nAlignment complete!")


if __name__ == "__main__":
    main()
