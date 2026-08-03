#!/usr/bin/env python3
"""
Download stock video clips from search results.

Usage:
    python download.py --results search_results.json --output ./stock/track_01/
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)


def download_video(url: str, output_path: str, timeout: int = 120) -> bool:
    """
    Download a video file.

    Args:
        url: Video download URL
        output_path: Local file path to save
        timeout: Request timeout in seconds

    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"  Downloading: {output_path}")
        response = requests.get(url, stream=True, timeout=timeout)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return True

    except requests.RequestException as e:
        print(f"  ERROR: Download failed: {e}")
        return False


def download_all(results_path: str, output_dir: str, max_clips: int = None) -> dict:
    """
    Download all videos from search results.

    Args:
        results_path: Path to search results JSON
        output_dir: Directory to save clips
        max_clips: Maximum number of clips to download (None = all)

    Returns:
        Metadata dict with downloaded clip info
    """
    # Load results
    with open(results_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    results = data.get('results', [])
    if max_clips:
        results = results[:max_clips]

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Download each clip
    downloaded = []
    for i, video in enumerate(results):
        url = video.get('download_url')
        if not url:
            continue

        # Generate filename
        source = video.get('source', 'unknown')
        video_id = video.get('id', i)
        filename = f"clip_{i+1:03d}_{source}_{video_id}.mp4"
        file_path = output_path / filename

        if download_video(url, str(file_path)):
            downloaded.append({
                "file": filename,
                "source": source,
                "id": video_id,
                "duration": video.get('duration'),
                "width": video.get('width'),
                "height": video.get('height'),
                "query": video.get('query'),
                "original_url": video.get('url')
            })

    # Save metadata
    metadata = {
        "total_clips": len(downloaded),
        "clips": downloaded
    }

    metadata_path = output_path / "metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    print(f"\nDownloaded {len(downloaded)} clips to: {output_dir}")
    print(f"Metadata saved to: {metadata_path}")

    return metadata


def main():
    parser = argparse.ArgumentParser(description="Download stock video clips")
    parser.add_argument("--results", "-r", required=True,
                       help="Search results JSON file")
    parser.add_argument("--output", "-o", required=True,
                       help="Output directory for clips")
    parser.add_argument("--max", "-m", type=int, default=None,
                       help="Maximum clips to download")

    args = parser.parse_args()

    results_path = Path(args.results)
    if not results_path.exists():
        print(f"ERROR: Results file not found: {results_path}")
        sys.exit(1)

    download_all(str(results_path), args.output, args.max)


if __name__ == "__main__":
    main()
