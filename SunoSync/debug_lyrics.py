import os
from mutagen.wave import WAVE
from mutagen.id3 import ID3, USLT

filepath = r"e:\SunoSync-main\Suno_Downloads\2025-11\COLLAPSE.wav"

print(f"Testing on: {filepath}")

if not os.path.exists(filepath):
    print("File not found!")
    exit()

# 1. Read existing
try:
    audio = WAVE(filepath)
    print("Read file successfully.")
    if audio.tags:
        print("Tags found.")
        for key in audio.tags.keys():
            if key.startswith('USLT'):
                print(f"Found existing lyrics key: {key}")
                print(f"Lyrics start: {str(audio.tags[key].text)[:50]}...")
    else:
        print("No tags found.")
except Exception as e:
    print(f"Error reading: {e}")

# 2. Write new lyrics
print("\nAttempting to write new lyrics...")
try:
    audio = WAVE(filepath)
    if audio.tags is None:
        audio.add_tags()
    
    # Remove old
    to_delete = [key for key in audio.tags.keys() if key.startswith('USLT')]
    for key in to_delete:
        del audio.tags[key]
        
    # Add new
    new_lyrics = "Debug Lyrics Test " + str(os.urandom(4).hex())
    audio.tags.add(USLT(encoding=3, lang='eng', desc='', text=new_lyrics))
    audio.save()
    print("Save called.")
except Exception as e:
    print(f"Error writing: {e}")

# 3. Read back
print("\nReading back...")
try:
    audio = WAVE(filepath)
    found = False
    if audio.tags:
        for key in audio.tags.keys():
            if key.startswith('USLT'):
                print(f"Found key: {key}")
                content = str(audio.tags[key].text)
                print(f"Content: {content}")
                if content == new_lyrics:
                    print("SUCCESS: Lyrics match!")
                    found = True
                else:
                    print("FAILURE: Lyrics do not match!")
    
    if not found:
        print("FAILURE: No lyrics found after save.")
        
except Exception as e:
    print(f"Error reading back: {e}")
