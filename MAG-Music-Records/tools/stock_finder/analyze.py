#!/usr/bin/env python3
"""
Analyze track prompt and lyrics to extract visual keywords for stock footage search.

Usage:
    python analyze.py --prompt prompt.txt --lyrics lyrics.txt --output keywords.json
"""

import argparse
import json
import re
import sys
from pathlib import Path


# Mood to visual keyword mappings
MOOD_KEYWORDS = {
    # Luxury/Success themes
    "luxury": ["luxury lifestyle", "wealth", "expensive car", "mansion", "champagne", "gold"],
    "success": ["success celebration", "achievement", "winner", "trophy", "business success"],
    "boss": ["boss lifestyle", "power", "leadership", "executive", "confident man"],
    "rich": ["wealthy lifestyle", "money", "diamonds", "luxury fashion", "penthouse"],

    # Emotional themes
    "love": ["romantic couple", "love", "intimacy", "holding hands", "sunset romance"],
    "romance": ["romantic dinner", "candles", "flowers", "date night", "kiss"],
    "heartbreak": ["lonely", "rain window", "sad person", "broken heart", "tears"],
    "triumph": ["celebration", "victory", "confetti", "champion", "arms raised"],

    # Energy themes
    "party": ["nightclub", "party dancing", "DJ", "club lights", "celebration"],
    "dance": ["dancing", "dance floor", "club dancing", "groove", "movement"],
    "chill": ["relaxing", "peaceful", "calm water", "meditation", "sunset"],
    "hype": ["crowd cheering", "concert", "energy", "excitement", "festival"],

    # Visual themes
    "night": ["city night", "neon lights", "night skyline", "street lights", "urban night"],
    "city": ["city skyline", "urban", "downtown", "skyscrapers", "city streets"],
    "ocean": ["ocean waves", "beach sunset", "tropical", "island", "sea"],
    "nature": ["mountains", "forest", "sunrise", "nature landscape", "scenic"],

    # Cultural themes
    "street": ["urban street", "hip hop culture", "graffiti", "street style", "city life"],
    "island": ["caribbean", "tropical island", "palm trees", "beach", "island vibes"],
    "elegant": ["elegant", "sophisticated", "classy", "refined", "high class"],
    "cinematic": ["cinematic", "dramatic", "epic", "movie scene", "film"],

    # Action themes
    "driving": ["driving luxury car", "road trip", "highway", "car interior", "night driving"],
    "flying": ["airplane", "private jet", "flying", "clouds", "aerial view"],
    "walking": ["walking city", "confident walk", "urban walking", "street walk"],
}

# Genre to default keywords
GENRE_KEYWORDS = {
    "luxury trap": ["luxury lifestyle", "city night", "expensive car", "gold chains", "penthouse"],
    "drill": ["urban street", "city night", "dark aesthetic", "hoodie", "street life"],
    "reggae": ["caribbean beach", "island sunset", "palm trees", "relaxing", "tropical"],
    "r&b": ["romantic", "intimate", "candle light", "couple", "sensual"],
    "club": ["nightclub", "party", "dancing", "DJ", "club lights"],
    "latin": ["latin dance", "salsa", "passionate", "fire", "hot"],
}


def extract_keywords_from_prompt(prompt_path: str) -> list[str]:
    """Extract mood and style keywords from Suno prompt."""
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt = f.read().lower()

    keywords = set()

    # Check for mood keywords
    for mood, visuals in MOOD_KEYWORDS.items():
        if mood in prompt:
            keywords.update(visuals[:3])  # Add top 3 visuals for each mood

    # Check for genre keywords
    for genre, visuals in GENRE_KEYWORDS.items():
        if genre in prompt:
            keywords.update(visuals)

    # Extract explicit descriptors
    descriptors = re.findall(r'\b(cinematic|dramatic|epic|smooth|dark|bright|warm|cold|golden|night|urban|street|luxury|elegant)\b', prompt)
    keywords.update(descriptors)

    return list(keywords)


def extract_keywords_from_lyrics(lyrics_path: str) -> list[str]:
    """Extract visual themes from lyrics."""
    with open(lyrics_path, 'r', encoding='utf-8') as f:
        lyrics = f.read().lower()

    keywords = set()

    # Check for mood keywords in lyrics
    for mood, visuals in MOOD_KEYWORDS.items():
        if mood in lyrics:
            keywords.update(visuals[:2])

    # Look for specific visual references
    visual_patterns = [
        (r'\b(sky|skies|stars|moon|sun)\b', ["sky", "stars", "moon", "sunset"]),
        (r'\b(car|drive|road|highway)\b', ["driving", "luxury car", "road trip"]),
        (r'\b(city|streets|downtown|urban)\b', ["city skyline", "urban street", "downtown"]),
        (r'\b(ocean|sea|beach|island|wave)\b', ["ocean waves", "beach sunset", "tropical island"]),
        (r'\b(rain|storm|thunder)\b', ["rain", "storm", "dramatic weather"]),
        (r'\b(fire|flame|burn)\b', ["fire", "flames", "burning"]),
        (r'\b(dance|dancing|move)\b', ["dancing", "dance floor", "movement"]),
        (r'\b(love|heart|romance)\b', ["romantic couple", "love", "hearts"]),
        (r'\b(money|cash|rich|wealth)\b', ["money", "wealth", "luxury"]),
        (r'\b(king|queen|crown|throne)\b', ["crown", "royalty", "throne"]),
    ]

    for pattern, visuals in visual_patterns:
        if re.search(pattern, lyrics):
            keywords.update(visuals[:2])

    return list(keywords)


def analyze_track(prompt_path: str, lyrics_path: str) -> dict:
    """
    Analyze track files and generate search keywords.

    Returns dict with categorized keywords.
    """
    prompt_keywords = []
    lyrics_keywords = []

    if prompt_path and Path(prompt_path).exists():
        prompt_keywords = extract_keywords_from_prompt(prompt_path)

    if lyrics_path and Path(lyrics_path).exists():
        lyrics_keywords = extract_keywords_from_lyrics(lyrics_path)

    # Combine and deduplicate
    all_keywords = list(set(prompt_keywords + lyrics_keywords))

    # If no keywords found, use defaults
    if not all_keywords:
        all_keywords = ["cinematic", "city night", "dramatic", "urban", "aesthetic"]

    return {
        "from_prompt": prompt_keywords,
        "from_lyrics": lyrics_keywords,
        "combined": all_keywords,
        "search_queries": all_keywords[:10]  # Top 10 for API queries
    }


def main():
    parser = argparse.ArgumentParser(description="Analyze track for visual keywords")
    parser.add_argument("--prompt", "-p", help="Suno prompt file")
    parser.add_argument("--lyrics", "-l", help="Lyrics file")
    parser.add_argument("--output", "-o", required=True, help="Output JSON file")

    args = parser.parse_args()

    if not args.prompt and not args.lyrics:
        print("ERROR: Must provide at least --prompt or --lyrics")
        sys.exit(1)

    print("Analyzing track for visual keywords...")
    result = analyze_track(args.prompt, args.lyrics)

    print(f"  From prompt: {len(result['from_prompt'])} keywords")
    print(f"  From lyrics: {len(result['from_lyrics'])} keywords")
    print(f"  Combined: {len(result['combined'])} unique keywords")
    print(f"\nSearch queries: {', '.join(result['search_queries'])}")

    # Save output
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)

    print(f"\nSaved to: {output_path}")


if __name__ == "__main__":
    main()
