import tkinter as tk
from tkinter import ttk
try:
    import vlc
    VLC_AVAILABLE = True
except (ImportError, OSError):
    VLC_AVAILABLE = False
import os
from threading import Thread
import time
import json
from suno_utils import open_file


class PlayerWidget(tk.Frame):
    """Audio player widget with playback controls."""
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        
        # VLC instance
        # VLC instance
        if VLC_AVAILABLE:
            try:
                self.instance = vlc.Instance('--no-xlib')  # Headless mode
                self.player = self.instance.media_player_new()
            except Exception as e:
                print(f"VLC Init Error: {e}")
                self.player = None
        else:
            self.player = None
        
        # Player state
        self.current_file = None
        self.is_playing = False
        self.duration = 0
        self.playlist = []
        self.current_index = -1
        self.tags = {}
        self.tags_file = None
        
        # Theme colors
        self.bg_dark = "#1a1a1a"
        self.bg_card = "#2d2d2d"
        self.fg_primary = "#e0e0e0"
        self.fg_secondary = "#9ca3af"
        self.accent_purple = "#8b5cf6"
        
        self.configure(bg=self.bg_dark, height=100)
        
        self.create_widgets()
        self.start_update_loop()
    
    def create_widgets(self):
        """Create player UI."""
        # Main container
        container = tk.Frame(self, bg=self.bg_card, height=90)
        container.pack(fill="both", expand=True, padx=10, pady=5)
        container.pack_propagate(False)
        
        # --- Left: Song Info ---
        info_frame = tk.Frame(container, bg=self.bg_card, width=250)
        info_frame.pack(side=tk.LEFT, fill="y", padx=10)
        info_frame.pack_propagate(False)
        
        # Now playing label
        self.now_playing_label = tk.Label(info_frame, text="No song playing",
                                         bg=self.bg_card, fg=self.fg_primary,
                                         font=("Segoe UI", 11, "bold"),
                                         anchor="w")
        self.now_playing_label.pack(fill="x", pady=(15, 0))
        
        if not self.player:
            self.now_playing_label.config(text="⚠️ VLC Player not found", fg="#ef4444")
            tk.Label(info_frame, text="Playback disabled", 
                    bg=self.bg_card, fg=self.fg_secondary,
                    font=("Segoe UI", 9)).pack(fill="x")
        
        # Artist label
        self.artist_label = tk.Label(info_frame, text="",
                                     bg=self.bg_card, fg=self.fg_secondary,
                                     font=("Segoe UI", 9),
                                     anchor="w")
        self.artist_label.pack(fill="x")

        # --- Right: Volume ---
        volume_frame = tk.Frame(container, bg=self.bg_card)
        volume_frame.pack(side=tk.RIGHT, padx=10)
        
        tk.Label(volume_frame, text="🔊", bg=self.bg_card, fg=self.fg_primary,
                font=("Segoe UI", 14)).pack(side=tk.LEFT, padx=(0, 5))
        
        self.volume_var = tk.IntVar(value=70)
        self.volume_slider = ttk.Scale(volume_frame, from_=0, to=100,
                                      orient="horizontal",
                                      variable=self.volume_var,
                                      command=self.on_volume_change,
                                      length=100)
        self.volume_slider.pack(side=tk.LEFT)

        # --- Center: Controls & Seek ---
        center_frame = tk.Frame(container, bg=self.bg_card)
        center_frame.pack(side=tk.LEFT, fill="both", expand=True, padx=10)
        
        # Controls (Buttons)
        controls_frame = tk.Frame(center_frame, bg=self.bg_card)
        controls_frame.pack(side=tk.TOP, pady=(10, 5))
        
        btn_style = {
            "bg": self.bg_dark,
            "fg": self.fg_primary,
            "font": ("Segoe UI", 16),
            "relief": "flat",
            "cursor": "hand2",
            "width": 3,
            "height": 1
        }
        
        # Previous button
        self.prev_btn = tk.Button(controls_frame, text="⏮", **btn_style,
                                  command=self.previous_song)
        self.prev_btn.pack(side=tk.LEFT, padx=5)
        
        # Play/Pause button (larger font)
        play_style = btn_style.copy()
        play_style["font"] = ("Segoe UI", 20)
        self.play_btn = tk.Button(controls_frame, text="▶", **play_style,
                                  command=self.toggle_playback)
        self.play_btn.pack(side=tk.LEFT, padx=5)
        
        # Stop button
        self.stop_btn = tk.Button(controls_frame, text="⏹", **btn_style,
                                  command=self.stop)
        self.stop_btn.pack(side=tk.LEFT, padx=5)
        
        # Next button
        self.next_btn = tk.Button(controls_frame, text="⏭", **btn_style,
                                  command=self.next_song)
        self.next_btn.pack(side=tk.LEFT, padx=5)
        
        # Tagging buttons
        tag_frame = tk.Frame(controls_frame, bg=self.bg_card)
        tag_frame.pack(side=tk.LEFT, padx=(20, 0))
        
        self.tag_btns = {}
        tags = [("👍", "keep", "#22c55e"), ("🗑️", "trash", "#ef4444"), ("⭐", "star", "#eab308")]
        
        for icon, tag, color in tags:
            btn = tk.Button(tag_frame, text=icon, **btn_style,
                           command=lambda t=tag: self.toggle_tag(t))
            btn.pack(side=tk.LEFT, padx=2)
            self.tag_btns[tag] = btn
            self.tag_colors = {tag: color for _, tag, color in tags}
            
        # Seek bar frame
        seek_frame = tk.Frame(center_frame, bg=self.bg_card)
        seek_frame.pack(side=tk.TOP, fill="x", padx=20)
        
        # Current time
        self.time_label = tk.Label(seek_frame, text="0:00",
                                   bg=self.bg_card, fg=self.fg_secondary,
                                   font=("Segoe UI", 8))
        self.time_label.pack(side=tk.LEFT, padx=(0, 5))
        
        # Seek slider
        self.seek_var = tk.IntVar(value=0)
        self.seek_slider = ttk.Scale(seek_frame, from_=0, to=100,
                                     orient="horizontal",
                                     variable=self.seek_var,
                                     command=self.on_seek)
        self.seek_slider.pack(side=tk.LEFT, fill="x", expand=True)
        
        # Duration time
        self.duration_label = tk.Label(seek_frame, text="0:00",
                                       bg=self.bg_card, fg=self.fg_secondary,
                                       font=("Segoe UI", 8))
        self.duration_label.pack(side=tk.LEFT, padx=(5, 0))
        
        # Set initial volume
        if self.player:
            self.player.audio_set_volume(70)

    def set_tags_file(self, filepath):
        """Set path to tags JSON file and load it."""
        self.tags_file = filepath
        self._load_tags()

    def _load_tags(self):
        if self.tags_file and os.path.exists(self.tags_file):
            try:
                with open(self.tags_file, 'r', encoding='utf-8') as f:
                    self.tags = json.load(f)
            except:
                self.tags = {}

    def _save_tags(self):
        if self.tags_file:
            try:
                with open(self.tags_file, 'w', encoding='utf-8') as f:
                    json.dump(self.tags, f)
            except:
                pass

    def set_playlist(self, songs, start_index=0):
        """Set the current playlist and start playing."""
        self.playlist = songs
        self.current_index = start_index
        if 0 <= self.current_index < len(self.playlist):
            self.play_song_at_index(self.current_index)

    def play_song_at_index(self, index):
        """Play song at specific playlist index."""
        if not 0 <= index < len(self.playlist):
            return
            
        self.current_index = index
        song = self.playlist[index]
        self.play_file(song['filepath'])
        self.update_tag_ui(song.get('id'))
        
        # Emit track changed event
        self.event_generate("<<TrackChanged>>")

    def toggle_tag(self, tag):
        """Toggle a tag for the current song."""
        if self.current_index < 0 or self.current_index >= len(self.playlist):
            return
            
        song = self.playlist[self.current_index]
        uuid = song.get('id')
        if not uuid:
            # Fallback to filepath if no UUID
            uuid = song['filepath']
            
        current_tag = self.tags.get(uuid)
        
        if current_tag == tag:
            # Untag
            if uuid in self.tags:
                del self.tags[uuid]
        else:
            # Set tag
            self.tags[uuid] = tag
            
        self._save_tags()
        self.update_tag_ui(uuid)
        
        # Notify library to update UI (via event or callback?)
        # For now, we rely on Library reloading tags when it refreshes or we can emit an event
        self.event_generate("<<TagsUpdated>>")

    def update_tag_ui(self, uuid):
        """Update tag buttons state."""
        current_tag = self.tags.get(uuid) if uuid else None
        
        for tag, btn in self.tag_btns.items():
            if tag == current_tag:
                btn.config(bg=self.tag_colors[tag], fg="white")
            else:
                btn.config(bg=self.bg_dark, fg=self.fg_primary)

    def play_file(self, filepath):
        """Play a specific file."""
        if not VLC_AVAILABLE or not self.player:
            return
        
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return
        
        self.current_file = filepath
        
        # Load media
        media = self.instance.media_new(filepath)
        self.player.set_media(media)
        
        # Start playback
        self.player.play()
        self.is_playing = True
        self.play_btn.config(text="⏸")
        
        # Wait for media to parse
        time.sleep(0.1)
        self.duration = self.player.get_length() // 1000 if self.player.get_length() > 0 else 0
        
        # Update UI
        filename = os.path.basename(filepath)
        title = os.path.splitext(filename)[0].replace('_', ' ')
        self.now_playing_label.config(text=title)
        self.artist_label.config(text=f"Playing from: {os.path.dirname(filepath)}")
        
        # Update duration label
        self.duration_label.config(text=self.format_time(self.duration))
    
    def toggle_playback(self):
        """Toggle play/pause."""
        if not self.player: return
        
        if not self.current_file:
            return
        
        if self.is_playing:
            self.player.pause()
            self.is_playing = False
            self.play_btn.config(text="▶")
        else:
            self.player.play()
            self.is_playing = True
            self.play_btn.config(text="⏸")
    
    def stop(self):
        """Stop playback."""
        if not self.player: return

        self.player.stop()
        self.is_playing = False
        self.play_btn.config(text="▶")
        self.seek_var.set(0)
        self.time_label.config(text="0:00")
    
    def on_seek(self, value):
        """Handle seek slider change."""
        if not self.player: return

        if not self.current_file or not self.is_playing:
            return
        
        # Convert slider value (0-100) to position (0.0-1.0)
        position = float(value) / 100.0
        self.player.set_position(position)
    
    def on_volume_change(self, value):
        """Handle volume slider change."""
        if not self.player: return

        volume = int(float(value))
        self.player.audio_set_volume(volume)
    
    def previous_song(self):
        """Play previous song."""
        if self.playlist and self.current_index > 0:
            self.play_song_at_index(self.current_index - 1)
    
    def next_song(self):
        """Play next song."""
        if self.playlist and self.current_index < len(self.playlist) - 1:
            self.play_song_at_index(self.current_index + 1)
    
    def start_update_loop(self):
        """Start the UI update loop."""
        def update():
            while True:
                time.sleep(0.5)
                if self.is_playing and self.duration > 0 and self.player:
                    # Update seek bar and time
                    try:
                        position = self.player.get_position()
                        if position >= 0:
                            current_time = int(position * self.duration)
                            self.seek_var.set(int(position * 100))
                            self.time_label.config(text=self.format_time(current_time))
                        
                        # Check if song ended
                        state = self.player.get_state()
                        if state == vlc.State.Ended:
                            self.is_playing = False
                            self.play_btn.config(text="▶")
                            self.next_song()  # Auto-play next
                    except Exception:
                        pass
        
        thread = Thread(target=update, daemon=True)
        thread.start()
    
    @staticmethod
    def format_time(seconds):
        """Format time as M:SS."""
        if seconds < 0:
            return "0:00"
        mins = seconds // 60
        secs = seconds % 60
        return f"{mins}:{secs:02d}"


if __name__ == "__main__":
    # Test the player standalone
    root = tk.Tk()
    root.title("Player Test")
    root.geometry("800x120")
    root.configure(bg="#1a1a1a")
    
    player = PlayerWidget(root)
    player.pack(fill="both", expand=True)
    
    # Test with a file (replace with actual path)
    test_file = "Suno_Downloads/test.mp3"  # Change this
    if os.path.exists(test_file):
        player.play_file(test_file)
    
    root.mainloop()
