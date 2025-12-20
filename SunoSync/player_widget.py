import tkinter as tk
import customtkinter as ctk
import os
import json
import random
import time
from threading import Thread

# Try VLC
try:
    import vlc
    VLC_AVAILABLE = True
except (ImportError, OSError):
    VLC_AVAILABLE = False

from discord_handler import DiscordRPC

class PlayerWidget(ctk.CTkFrame):
    """Audio player widget with playback controls."""
    
    def __init__(self, parent, bg_color="#18181b", **kwargs):
        super().__init__(parent, fg_color=bg_color, corner_radius=0, height=90, **kwargs)
        
        # VLC Setup
        self.instance = None
        self.player = None
        if VLC_AVAILABLE:
            try:
                self.instance = vlc.Instance('--no-xlib')
                self.player = self.instance.media_player_new()
            except Exception:
                self.player = None
        
        # Discord RPC
        self.discord = DiscordRPC()

        # State
        self.current_file = None
        self.current_song_data = None  # Store full song metadata
        self.is_playing = False
        self.duration = 0
        self.playlist = []
        self.current_index = -1
        self.tags = {}
        self.tags_file = None
        self.library_tab = None
        self.lyrics_panel = None  # Will be set by main app
        self.shuffle_mode = False
        self.repeat_mode = 0 # 0=Off, 1=All, 2=One
        self.mini_mode_callback = None
        
        # Album art cache
        import tempfile
        self.art_cache_dir = os.path.join(tempfile.gettempdir(), "sunosync_art")
        os.makedirs(self.art_cache_dir, exist_ok=True)
        self.current_art_image = None
        
        # UI
        self._create_widgets()
        
        # Update Loop
        self._update_loop()

    def destroy(self):
        if hasattr(self, 'discord'):
            self.discord.close()
        super().destroy()

    def _create_widgets(self):
        # Layout: Top is seeker, Bottom is controls split 3 ways
        self.grid_columnconfigure(1, weight=1) # Center expands
        
        # Seeker
        self.seek_var = ctk.DoubleVar(value=0)
        self.seeker = ctk.CTkSlider(self, from_=0, to=100, variable=self.seek_var, 
                                    command=self.on_seek, height=16, 
                                    progress_color="#8b5cf6", button_color="#8b5cf6", button_hover_color="#7c3aed")
        self.seeker.pack(fill="x", padx=0, pady=(0, 5))
        
        # Main Bar
        self.bar = ctk.CTkFrame(self, fg_color="transparent")
        self.bar.pack(fill="both", expand=True, padx=20, pady=(0, 10))
        
        # Priority: Controls (1) and Right (2) get requested space. Info (0) gets remaining.
        self.bar.grid_columnconfigure(0, weight=1)
        self.bar.grid_columnconfigure(1, weight=0)
        self.bar.grid_columnconfigure(2, weight=0)
        
        # Left: Info
        self.info_frame = ctk.CTkFrame(self.bar, fg_color="transparent")
        self.info_frame.grid(row=0, column=0, sticky="ew", padx=(0, 5))
        
        # Album Art (60x60)
        self.album_art_label = ctk.CTkLabel(self.info_frame, text="", width=60, height=60, fg_color="#27272a")
        self.album_art_label.pack(side="left", padx=(0, 10))
        
        # Text info
        self.text_frame = ctk.CTkFrame(self.info_frame, fg_color="transparent")
        self.text_frame.pack(side="left", fill="y")
        
        self.title_label = ctk.CTkLabel(self.text_frame, text="Ready", font=("Segoe UI", 14, "bold"), anchor="w")
        self.title_label.pack(anchor="w")
        
        self.artist_label = ctk.CTkLabel(self.text_frame, text="Select a song", font=("Segoe UI", 12), text_color="gray", anchor="w")
        self.artist_label.pack(anchor="w")

        # Center: Controls
        self.controls_frame = ctk.CTkFrame(self.bar, fg_color="transparent")
        self.controls_frame.grid(row=0, column=1, padx=5)
        
        # Buttons
        self.shuffle_btn = ctk.CTkButton(self.controls_frame, text="🔀", width=30, fg_color="transparent", text_color="#a1a1aa", hover_color="#3f3f46", command=self.toggle_shuffle)
        self.shuffle_btn.pack(side="left", padx=2)
        
        self.prev_btn = ctk.CTkButton(self.controls_frame, text="⏮", width=35, fg_color="transparent", text_color="white", hover_color="#3f3f46", font=("Segoe UI", 18), command=self.previous_song)
        self.prev_btn.pack(side="left", padx=2)
        
        self.play_btn = ctk.CTkButton(self.controls_frame, text="▶", width=42, height=42, corner_radius=21, 
                                      fg_color="#8b5cf6", text_color="white", hover_color="#7c3aed", 
                                      font=("Segoe UI", 20), command=self.toggle_playback)
        self.play_btn.pack(side="left", padx=8)
        
        self.next_btn = ctk.CTkButton(self.controls_frame, text="⏭", width=35, fg_color="transparent", text_color="white", hover_color="#3f3f46", font=("Segoe UI", 18), command=self.next_song)
        self.next_btn.pack(side="left", padx=2)
        
        self.repeat_btn = ctk.CTkButton(self.controls_frame, text="🔁", width=30, fg_color="transparent", text_color="#a1a1aa", hover_color="#3f3f46", command=self.toggle_repeat)
        self.repeat_btn.pack(side="left", padx=2)

        # Right: Volume & Tags
        self.right_frame = ctk.CTkFrame(self.bar, fg_color="transparent")
        self.right_frame.grid(row=0, column=2, sticky="e")
        
        # Tags
        self.tag_btns = {}
        tags = [("👍", "keep", "#22c55e"), ("🗑️", "trash", "#ef4444"), ("⭐", "star", "#eab308")]
        
        for icon, tag, color in tags:
            btn = ctk.CTkButton(self.right_frame, text=icon, width=30, fg_color="transparent", 
                                command=lambda t=tag: self.toggle_tag(t))
            btn.pack(side="left", padx=2)
            self.tag_btns[tag] = (btn, color) # Store btn and color
            
        # Time
        self.time_label = ctk.CTkLabel(self.right_frame, text="0:00 / 0:00", text_color="gray")
        self.time_label.pack(side="left", padx=15)
        
        # Mini Mode
        self.mini_btn = ctk.CTkButton(self.right_frame, text="⤢", width=30, fg_color="transparent",
                                     hover_color="#7c3aed", command=self.toggle_mini_mode)
        self.mini_btn.pack(side="left", padx=(0, 5))

        # Lyrics button
        self.lyrics_btn = ctk.CTkButton(self.right_frame, text="🎤", width=30, fg_color="transparent",
                                        hover_color="#7c3aed", command=self.toggle_lyrics)
        self.lyrics_btn.pack(side="left", padx=5)
        
        # Volume
        self.vol_icon = ctk.CTkLabel(self.right_frame, text="🔊")
        self.vol_icon.pack(side="left")
        self.volume_slider = ctk.CTkSlider(self.right_frame, from_=0, to=100, width=80, command=self.on_volume_change)
        self.volume_slider.set(70)
        self.volume_slider.pack(side="left", padx=5)
        
        if self.player:
            self.player.audio_set_volume(70)

    # --- Logic ---
    def set_tags_file(self, filepath):
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
                os.makedirs(os.path.dirname(self.tags_file), exist_ok=True)
                with open(self.tags_file, 'w', encoding='utf-8') as f:
                    json.dump(self.tags, f, indent=2)
            except Exception as e:
                print(f"Error saving tags: {e}")

    def set_library_tab(self, tab):
        self.library_tab = tab
    
    def set_lyrics_panel(self, panel):
        """Set the lyrics panel reference."""
        self.lyrics_panel = panel
    
    def toggle_lyrics(self):
        """Toggle lyrics panel visibility."""
        if self.lyrics_panel:
            self.lyrics_panel.toggle()

    def set_mini_mode_callback(self, callback):
        self.mini_mode_callback = callback
        
    def toggle_mini_mode(self):
        if self.mini_mode_callback:
            self.mini_mode_callback()
            
    def set_mini_btn_icon(self, is_mini):
        self.mini_btn.configure(text="⤡" if is_mini else "⤢")
        self.mini_is_active = is_mini
        if is_mini:
            self.enable_mini_layout()
        else:
            self.disable_mini_layout()

    def enable_mini_layout(self):
        # 1. Container Style (600x80)
        self.configure(border_width=1, border_color="#333333")
        
        # Reset Packing to ensure order
        self.bar.pack_forget()
        self.seeker.pack_forget()
        
        # 2. Seeker (Bottom)
        self.seeker.configure(height=4, button_length=0) 
        self.seeker.pack(side="bottom", fill="x", padx=0, pady=0)
        
        # 3. Bar Frame (Top)
        self.bar.pack(side="top", fill="both", expand=True, padx=0, pady=(0, 4))
        
        # 4. Grid Setup
        self.bar.grid_columnconfigure(0, weight=1)
        self.bar.grid_columnconfigure(1, weight=0)
        self.bar.grid_columnconfigure(2, weight=0)
        
        # 5. Left Section (Col 0)
        self.info_frame.grid_configure(row=0, column=0, sticky="ew", padx=15)
        # Ensure text labels are visible
        self.album_art_label.pack_forget() # Hide art
        self.title_label.configure(font=("Segoe UI", 13, "bold"), text_color="white") 
        self.artist_label.configure(font=("Segoe UI", 11), text_color="gray") 
        
        # 6. Center Section (Col 1)
        self.controls_frame.grid_configure(row=0, column=1)
        self.shuffle_btn.pack_forget()
        self.repeat_btn.pack_forget()
        
        self.play_btn.configure(width=40, height=40, corner_radius=20, fg_color="#8b5cf6")
        self.prev_btn.configure(width=30, height=30, fg_color="transparent")
        self.next_btn.configure(width=30, height=30, fg_color="transparent")
        
        # 7. Right Section (Col 2)
        self.right_frame.grid_configure(row=0, column=2, sticky="e", padx=10)
        
        # Clear Right Layout
        for widget in self.right_frame.winfo_children():
            widget.pack_forget()
            
        # Add Volume and Expand Only
        self.mini_btn.pack(side="right", padx=(5, 0)) # Expand button
        self.volume_slider.configure(width=80)
        self.volume_slider.pack(side="right", padx=5) # Volume Slider
        
        # Bind Dragging
        bind_list = [self, self.bar, self.info_frame, self.text_frame, self.controls_frame, self.right_frame, self.title_label, self.artist_label]
        for widget in bind_list:
            widget.bind("<Button-1>", self.start_move)
            widget.bind("<B1-Motion>", self.do_move)

    def disable_mini_layout(self):
        self.configure(border_width=0)
        
        # Restore Weights
        self.bar.grid_columnconfigure(0, weight=1)
        self.bar.grid_columnconfigure(1, weight=0)
        self.bar.grid_columnconfigure(2, weight=0)
        
        # Restore Seeker
        self.seeker.pack_forget()
        self.seeker.pack(side="top", fill="x", padx=0, pady=(0, 5))
        self.seeker.configure(height=16) # Restore default? 
        
        # Restore Bar
        self.bar.pack_configure(padx=20, pady=(0, 10))
        
        # Restore Left Info
        self.info_frame.grid_configure(padx=(0, 5))
        self.album_art_label.pack(side="left", padx=(0, 10), before=self.text_frame)
        self.title_label.configure(font=("Segoe UI", 14, "bold"))
        self.artist_label.configure(font=("Segoe UI", 12))
        
        # Restore Controls
        self.play_btn.configure(width=42, height=42, corner_radius=21)
        self.shuffle_btn.pack(side="left", padx=2, before=self.prev_btn)
        self.repeat_btn.pack(side="left", padx=2, after=self.next_btn)
        
        # Restore Right Zone (Like, Trash, Loop, Star, Time, etc)
        for widget in self.right_frame.winfo_children():
            widget.pack_forget()
        
        # Re-pack Standard Order (side=left)
        # Tags (Like/Trash/Star), Time, Mini, Lyrics, VolIcon, VolSlider
        for tag, (btn, _) in self.tag_btns.items():
             btn.pack(side="left", padx=2)
        self.time_label.pack(side="left", padx=15)
        self.mini_btn.pack(side="left", padx=(0, 5))
        self.lyrics_btn.pack(side="left", padx=5)
        self.vol_icon.pack(side="left")
        self.volume_slider.configure(width=80)
        self.volume_slider.pack(side="left", padx=5)
        
        # Unbind Dragging
        bind_list = [self, self.bar, self.info_frame, self.text_frame, self.controls_frame, self.right_frame, self.title_label, self.artist_label]
        for widget in bind_list:
            widget.unbind("<Button-1>")
            widget.unbind("<B1-Motion>")

    def start_move(self, event):
        self.x = event.x
        self.y = event.y

    def do_move(self, event):
        try:
            deltax = event.x - self.x
            deltay = event.y - self.y
            x = self.winfo_toplevel().winfo_x() + deltax
            y = self.winfo_toplevel().winfo_y() + deltay
            self.winfo_toplevel().geometry(f"+{x}+{y}")
        except: pass
            


    def set_playlist(self, songs, start_index=0):
        self.playlist = songs
        self.current_index = start_index
        if 0 <= self.current_index < len(self.playlist):
            self.play_song_at_index(self.current_index)

    def play_song_at_index(self, index):
        if not 0 <= index < len(self.playlist): return
        
        self.current_index = index
        song = self.playlist[index]
        self.current_song_data = song  # Store full metadata
        filepath = os.path.normpath(song['filepath'])
        
        if self.play_file(filepath):
            self.update_tag_ui(song.get('id'))
            
            # Update album art
            self.update_album_art(song)
            
            # Update lyrics panel if visible
            if self.lyrics_panel and self.lyrics_panel.is_visible:
                self.lyrics_panel.update_from_song(song)
            
            self.after(100, lambda: self.event_generate("<<TrackChanged>>"))

    def update_album_art(self, song_data):
        """Fetch and display album art for the current song."""
        image_url = song_data.get('image_url')
        song_id = song_data.get('id', 'unknown')
        
        if not image_url:
            # Show placeholder
            self.album_art_label.configure(image=None, text="🎵", font=("Segoe UI", 24))
            return
        
        # Check cache first
        cache_path = os.path.join(self.art_cache_dir, f"{song_id}.jpg")
        
        if os.path.exists(cache_path):
            # Load from cache
            self._display_album_art(cache_path)
        else:
            # Download in background
            Thread(target=self._download_album_art, args=(image_url, cache_path), daemon=True).start()

    def _download_album_art(self, url, cache_path):
        """Download album art to cache."""
        try:
            import requests
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                with open(cache_path, 'wb') as f:
                    f.write(response.content)
                # Display on main thread
                self.after(0, lambda: self._display_album_art(cache_path))
        except Exception as e:
            print(f"Failed to download album art: {e}")

    def _display_album_art(self, image_path):
        """Display album art from file path."""
        try:
            from PIL import Image
            img = Image.open(image_path)
            img = img.resize((60, 60), Image.Resampling.LANCZOS)
            
            # Convert to CTkImage
            ctk_image = ctk.CTkImage(light_image=img, dark_image=img, size=(60, 60))
            self.current_art_image = ctk_image  # Keep reference
            self.album_art_label.configure(image=ctk_image, text="")
        except Exception as e:
            print(f"Failed to display album art: {e}")
            self.album_art_label.configure(image=None, text="🎵", font=("Segoe UI", 24))

    def play_file(self, filepath):
        if not VLC_AVAILABLE or not self.player:
            return False
            
        if not os.path.exists(filepath):
            return False
            
        self.current_file = filepath
        try:
            if self.is_playing:
                self.player.stop()
            
            media = self.instance.media_new(filepath)
            self.player.set_media(media)
            self.player.play()
            
            self.is_playing = True
            self.play_btn.configure(text="⏸")
            
            # Wait for length
            for _ in range(20):
                time.sleep(0.05)
                if self.player.get_length() > 0:
                    self.duration = self.player.get_length() // 1000
                    break
            else:
                self.duration = 0
                
            filename = os.path.basename(filepath)
            title = os.path.splitext(filename)[0].replace('_', ' ')
            self.title_label.configure(text=title[:40]) # Truncate
            artist = os.path.dirname(filepath).split(os.sep)[-1] # Use folder name as artist roughly
            self.artist_label.configure(text=artist)
            
            # Update Discord
            self.discord.update_presence(title, artist, self.duration, 0, False)

            return True
        except Exception as e:
            print(f"Play error: {e}")
            return False

    def toggle_playback(self):
        if not self.player or not self.current_file: return
        
        filename = os.path.basename(self.current_file)
        title = os.path.splitext(filename)[0].replace('_', ' ')
        artist = os.path.dirname(self.current_file).split(os.sep)[-1]
        
        if self.is_playing:
            self.player.pause()
            self.is_playing = False
            self.play_btn.configure(text="▶")
            self.discord.update_presence(title, artist, is_paused=True)
        else:
            self.player.play()
            self.is_playing = True
            self.play_btn.configure(text="⏸")
            
            # Get current pos
            pos = self.player.get_position()
            current_time = 0
            if pos >= 0:
                current_time = pos * self.duration
                
            self.discord.update_presence(title, artist, self.duration, current_time, False)

    def on_seek(self, value):
        if not self.player or not self.is_playing: return
        self.player.set_position(value / 100.0)

    def on_volume_change(self, value):
        if self.player:
            self.player.audio_set_volume(int(value))

    def toggle_shuffle(self):
        self.shuffle_mode = not self.shuffle_mode
        self.shuffle_btn.configure(text_color="#8b5cf6" if self.shuffle_mode else "gray")

    def toggle_repeat(self):
        self.repeat_mode = (self.repeat_mode + 1) % 3
        colors = ["gray", "#8b5cf6", "#d946ef"]
        texts = ["🔁", "🔁", "🔂"]
        self.repeat_btn.configure(text=texts[self.repeat_mode], text_color=colors[self.repeat_mode])

    def next_song(self):
        if not self.playlist: return
        
        new_index = self.current_index + 1
        if self.shuffle_mode:
            new_index = random.randint(0, len(self.playlist) - 1)
        elif self.repeat_mode == 2:
            new_index = self.current_index
        
        if new_index >= len(self.playlist):
            if self.repeat_mode == 1: new_index = 0
            else: return # Stop
            
        self.play_song_at_index(new_index)

    def previous_song(self):
        new_index = self.current_index - 1
        if new_index < 0: return
        self.play_song_at_index(new_index)

    def toggle_tag(self, tag):
        # Logic matches previous impl but simplified for brevity
        uuid = None
        if self.current_index >= 0:
            uuid = self.playlist[self.current_index].get('id')
            
        if not uuid and self.library_tab:
             path = self.library_tab.get_selected_filepath()
             if path: uuid = path # Fallback to path as ID if needed
        
        if not uuid: return
        
        # Tag logic
        if self.tags.get(uuid) == tag:
            del self.tags[uuid]
        else:
            self.tags[uuid] = tag
            
        self._save_tags()
        self.update_tag_ui(uuid)
        self.event_generate("<<TagsUpdated>>")

    def update_tag_ui(self, uuid):
        current = self.tags.get(uuid)
        for tag, (btn, color) in self.tag_btns.items():
            if tag == current:
                btn.configure(fg_color=color, text_color="white")
            else:
                btn.configure(fg_color="transparent", text_color="gray")

    def _update_loop(self):
        if self.is_playing and self.player:
            pos = self.player.get_position()
            if pos >= 0:
                self.seek_var.set(pos * 100)
                current = int(pos * self.duration)
                self.time_label.configure(text=f"{current//60}:{current%60:02d} / {self.duration//60}:{self.duration%60:02d}")
            
            if self.player.get_state() == vlc.State.Ended:
                 self.next_song()
        
        self.after(500, self._update_loop)
