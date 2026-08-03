#!/usr/bin/env python3
"""
Search stock video APIs (Pexels, Pixabay) for footage matching track mood.

Usage:
    python search.py --queries "luxury,city night,success" --count 10 --output results.json

Environment Variables:
    PEXELS_API_KEY - Your Pexels API key (get free at pexels.com/api)
    PIXABAY_API_KEY - Your Pixabay API key (get free at pixabay.com/api/docs)
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)


PEXELS_API_URL = "https://api.pexels.com/videos/search"
PIXABAY_API_URL = "https://pixabay.com/api/videos/"


def search_pexels(query: str, count: int = 10, orientation: str = "landscape") -> list[dict]:
    """
    Search Pexels API for videos.

    Args:
        query: Search query
        count: Number of results to return
        orientation: landscape, portrait, or square

    Returns:
        List of video results with metadata
    """
    api_key = os.environ.get("PEXELS_API_KEY")
    if not api_key:
        print("WARNING: PEXELS_API_KEY not set, skipping Pexels search")
        return []

    headers = {"Authorization": api_key}
    params = {
        "query": query,
        "per_page": count,
        "orientation": orientation
    }

    try:
        response = requests.get(PEXELS_API_URL, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        results = []
        for video in data.get("videos", []):
            # Get the HD quality video file
            video_files = video.get("video_files", [])
            hd_file = None
            for vf in video_files:
                if vf.get("quality") == "hd" or vf.get("height", 0) >= 720:
                    hd_file = vf
                    break

            if not hd_file and video_files:
                hd_file = video_files[0]

            if hd_file:
                results.append({
                    "source": "pexels",
                    "id": video.get("id"),
                    "url": video.get("url"),
                    "download_url": hd_file.get("link"),
                    "width": hd_file.get("width"),
                    "height": hd_file.get("height"),
                    "duration": video.get("duration"),
                    "user": video.get("user", {}).get("name"),
                    "query": query
                })

        return results

    except requests.RequestException as e:
        print(f"ERROR: Pexels API request failed: {e}")
        return []


def search_pixabay(query: str, count: int = 10, video_type: str = "all") -> list[dict]:
    """
    Search Pixabay API for videos.

    Args:
        query: Search query
        count: Number of results to return
        video_type: all, film, or animation

    Returns:
        List of video results with metadata
    """
    api_key = os.environ.get("PIXABAY_API_KEY")
    if not api_key:
        print("WARNING: PIXABAY_API_KEY not set, skipping Pixabay search")
        return []

    params = {
        "key": api_key,
        "q": query,
        "per_page": count,
        "video_type": video_type
    }

    try:
        response = requests.get(PIXABAY_API_URL, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        results = []
        for video in data.get("hits", []):
            videos = video.get("videos", {})
            # Prefer large, then medium quality
            video_data = videos.get("large") or videos.get("medium") or videos.get("small", {})

            if video_data:
                results.append({
                    "source": "pixabay",
                    "id": video.get("id"),
                    "url": video.get("pageURL"),
                    "download_url": video_data.get("url"),
                    "width": video_data.get("width"),
                    "height": video_data.get("height"),
                    "duration": video.get("duration"),
                    "user": video.get("user"),
                    "query": query
                })

        return results

    except requests.RequestException as e:
        print(f"ERROR: Pixabay API request failed: {e}")
        return []


def search_all(queries: list[str], count_per_query: int = 5) -> list[dict]:
    """
    Search all available APIs for each query.

    Args:
        queries: List of search queries
        count_per_query: Number of results per query per source

    Returns:
        Combined list of all results
    """
    all_results = []

    for query in queries:
        print(f"Searching for: {query}")

        # Search Pexels
        pexels_results = search_pexels(query, count_per_query)
        print(f"  Pexels: {len(pexels_results)} results")
        all_results.extend(pexels_results)

        # Search Pixabay
        pixabay_results = search_pixabay(query, count_per_query)
        print(f"  Pixabay: {len(pixabay_results)} results")
        all_results.extend(pixabay_results)

    return all_results


def main():
    parser = argparse.ArgumentParser(description="Search stock video APIs")
    parser.add_argument("--queries", "-q", required=True,
                       help="Comma-separated search queries")
    parser.add_argument("--count", "-c", type=int, default=5,
                       help="Results per query per source (default: 5)")
    parser.add_argument("--output", "-o", required=True,
                       help="Output JSON file")
    parser.add_argument("--pexels-only", action="store_true",
                       help="Only search Pexels")
    parser.add_argument("--pixabay-only", action="store_true",
                       help="Only search Pixabay")

    args = parser.parse_args()

    queries = [q.strip() for q in args.queries.split(',')]
    print(f"Searching for {len(queries)} queries...")

    results = search_all(queries, args.count)

    # Save results
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            "queries": queries,
            "total_results": len(results),
            "results": results
        }, f, indent=2)

    print(f"\nSaved {len(results)} results to: {output_path}")


if __name__ == "__main__":
    main()
