import tkinter as tk
from tkinter import ttk, messagebox
import os
import json
import threading
import queue
import time
from suno_utils import read_song_metadata, save_lyrics_to_file, open_file
from theme_manager import ThemeManager


class LibraryTab(tk.Frame):
    """Library tab for browsing and playing downloaded songs."""
    
    def __init__(self, parent, config_manager, cache_file=None, tags_file=None, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.config_manager = config_manager
        self.cache_file = cache_file
        self.tags_file = tags_file
        self.download_path = self.config_manager.get("path", "")
        self.all_songs = []  # Full song list
        self.filtered_songs = []  # Filtered by search
        self.tags = {}
        self._load_tags()
        
        # Caching & Threading
        self.cache = {}
        self.scan_queue = queue.Queue()
        self.is_scanning = False
        self._load_cache()
        
        # Apply theme
        theme = ThemeManager()
        self.bg_dark = theme.bg_dark
        self.bg_card = theme.bg_card
        self.bg_input = theme.bg_input  # Added for text area
        self.fg_primary = theme.fg_primary
        self.fg_secondary = theme.fg_secondary
        self.accent_purple = theme.accent_purple
        
        self.configure(bg=self.bg_dark)
        
        self.create_widgets()
        self.refresh_library()
    
    def create_widgets(self):
        """Create the library UI."""
        # Top toolbar
        toolbar = tk.Frame(self, bg=self.bg_dark, height=60)
        toolbar.pack(fill="x", padx=20, pady=(20, 10))
        
        # Search bar
        search_frame = tk.Frame(toolbar, bg=self.bg_card, highlightthickness=1, 
                               highlightbackground=self.fg_secondary)
        search_frame.pack(side=tk.LEFT, fill="x", expand=True, padx=(0, 10))
        
        tk.Label(search_frame, text="🔍", bg=self.bg_card, fg=self.fg_secondary,
                font=("Segoe UI", 12)).pack(side=tk.LEFT, padx=(10, 5))
        
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", self.on_search)
        search_entry = tk.Entry(search_frame, textvariable=self.search_var,
                               bg=self.bg_card, fg=self.fg_primary,
                               font=("Segoe UI", 10), relief="flat", bd=0)
        search_entry.pack(side=tk.LEFT, fill="x", expand=True, padx=(0, 10), pady=8)
        
        # Refresh button
        self.refresh_btn = tk.Button(toolbar, text="🔄 Refresh", command=self.refresh_library,
                                bg=self.accent_purple, fg="white",
                                font=("Segoe UI", 10, "bold"),
                                relief="flat", cursor="hand2",
                                padx=20, pady=8)
        self.refresh_btn.pack(side=tk.RIGHT)
        
        # Open Folder button
        folder_btn = tk.Button(toolbar, text="📂 Open Folder", command=self.open_download_folder,
                               bg=self.bg_card, fg=self.fg_primary,
                               font=("Segoe UI", 10),
                               relief="flat", cursor="hand2",
                               padx=15, pady=8)
        folder_btn.pack(side=tk.RIGHT, padx=10)
        
        # About button
        about_btn = tk.Button(toolbar, text="ℹ️ About", command=self.show_about,
                               bg=self.bg_card, fg=self.fg_primary,
                               font=("Segoe UI", 10),
                               relief="flat", cursor="hand2",
                               padx=15, pady=8)
        about_btn.pack(side=tk.RIGHT, padx=10)
        
        # Song count label
        self.count_label = tk.Label(toolbar, text="0 songs", bg=self.bg_dark,
                                   fg=self.fg_secondary, font=("Segoe UI", 9))
        self.count_label.pack(side=tk.RIGHT, padx=10)
        
        # Treeview (file list)
        tree_frame = tk.Frame(self, bg=self.bg_dark)
        tree_frame.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        
        # Create Treeview with custom styling
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Library.Treeview",
                       background=self.bg_card,
                       foreground=self.fg_primary,
                       fieldbackground=self.bg_card,
                       borderwidth=0,
                       font=("Segoe UI", 10))
        style.configure("Library.Treeview.Heading",
                       background=self.bg_dark,
                       foreground=self.fg_primary,
                       borderwidth=0,
                       font=("Segoe UI", 10, "bold"))
        style.map("Library.Treeview",
                 background=[("selected", self.accent_purple)])
        
        # Scrollbars
        v_scroll = ttk.Scrollbar(tree_frame, orient="vertical")
        v_scroll.pack(side=tk.RIGHT, fill="y")
        
        h_scroll = ttk.Scrollbar(tree_frame, orient="horizontal")
        h_scroll.pack(side=tk.BOTTOM, fill="x")
        
        # Treeview columns
        self.tree = ttk.Treeview(tree_frame, style="Library.Treeview",
                                columns=("tag", "title", "artist", "duration", "date", "size"),
                                show="headings",
                                yscrollcommand=v_scroll.set,
                                xscrollcommand=h_scroll.set)
        
        # Column headings
        self.tree.heading("tag", text="", command=lambda: self.sort_column("tag"))
        self.tree.heading("title", text="Title", command=lambda: self.sort_column("title"))
        self.tree.heading("artist", text="Artist", command=lambda: self.sort_column("artist"))
        self.tree.heading("duration", text="Duration", command=lambda: self.sort_column("duration"))
        self.tree.heading("date", text="Date", command=lambda: self.sort_column("date"))
        self.tree.heading("size", text="Size", command=lambda: self.sort_column("size"))
        
        # Column widths
        self.tree.column("tag", width=30, minwidth=30, anchor="center")
        self.tree.column("title", width=300, minwidth=150)
        self.tree.column("artist", width=200, minwidth=100)
        self.tree.column("duration", width=80, minwidth=60)
        self.tree.column("date", width=100, minwidth=80)
        self.tree.column("size", width=80, minwidth=60)
        
        self.tree.pack(side=tk.LEFT, fill="both", expand=True)
        
        v_scroll.config(command=self.tree.yview)
        h_scroll.config(command=self.tree.xview)
        
        self.tree.bind("<Double-1>", self.on_double_click)
        
        # Right-click menu
        self.context_menu = tk.Menu(self, tearoff=0, bg=self.bg_card, fg=self.fg_primary)
        self.context_menu.add_command(label="Play", command=self.play_selected)
        self.context_menu.add_command(label="View/Edit Lyrics", command=self.edit_lyrics)
        self.context_menu.add_command(label="Open Folder", command=self.open_folder)
        self.context_menu.add_separator()
        self.context_menu.add_command(label="Delete", command=self.delete_selected)
        
        self.tree.bind("<Button-3>", self.show_context_menu)

    def _load_tags(self):
        """Load tags from file."""
        if self.tags_file and os.path.exists(self.tags_file):
            try:
                with open(self.tags_file, 'r', encoding='utf-8') as f:
                    self.tags = json.load(f)
            except:
                self.tags = {}
    
    def reload_tags(self):
        """Reload tags and update UI."""
        self._load_tags()
        self.update_tree()

    def _get_tag_icon(self, song):
        """Get icon for song tag."""
        uuid = song.get('id')
        if not uuid:
            uuid = song['filepath']
            
        tag = self.tags.get(uuid)
        if tag == "keep": return "👍"
        if tag == "trash": return "🗑️"
        if tag == "star": return "⭐"
        return ""

    def _load_cache(self):
        """Load metadata cache from file."""
        if self.cache_file and os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.cache = json.load(f)
            except Exception as e:
                print(f"Error loading cache: {e}")
                self.cache = {}

    def _save_cache(self):
        """Save metadata cache to file."""
        if self.cache_file:
            try:
                with open(self.cache_file, 'w', encoding='utf-8') as f:
                    json.dump(self.cache, f)
            except Exception as e:
                print(f"Error saving cache: {e}")

    def _scan_thread(self):
        """Background thread to scan library."""
        new_songs = []
        cache_updated = False
        
        try:
            for root, dirs, files in os.walk(self.download_path):
                for file in files:
                    if file.lower().endswith(('.mp3', '.wav')):
                        filepath = os.path.join(root, file)
                        mtime = os.path.getmtime(filepath)
                        
                        # Check cache
                        cached_data = self.cache.get(filepath)
                        if cached_data and cached_data.get('mtime') == mtime:
                            song_data = cached_data
                        else:
                            # Parse file
                            song_data = read_song_metadata(filepath)
                            if song_data:
                                song_data['mtime'] = mtime
                                self.cache[filepath] = song_data
                                cache_updated = True
                        
                        if song_data:
                            new_songs.append(song_data)
                            
                            # Batch update UI every 20 songs
                            if len(new_songs) >= 20:
                                self.scan_queue.put(("batch", list(new_songs)))
                                new_songs = []
                                
            # Final batch
            if new_songs:
                self.scan_queue.put(("batch", new_songs))
                
            self.scan_queue.put(("done", None))
            
            if cache_updated:
                self._save_cache()
                
        except Exception as e:
            print(f"Scan error: {e}")
            self.scan_queue.put(("done", None))

    def _process_scan_queue(self):
        """Process updates from scan thread."""
        try:
            while True:
                msg_type, data = self.scan_queue.get_nowait()
                
                if msg_type == "batch":
                    self.all_songs.extend(data)
                    # Sort and update tree (maybe optimize to not sort every batch?)
                    # For now, just append to tree to be fast
                    self._add_songs_to_tree(data)
                    self.count_label.config(text=f"{len(self.all_songs)} songs")
                    
                elif msg_type == "done":
                    self.is_scanning = False
                    self.refresh_btn.config(state="normal", text="🔄 Refresh")
                    # Final sort
                    self.all_songs.sort(key=lambda x: x['date'], reverse=True)
                    self.filtered_songs = self.all_songs.copy()
                    self.update_tree()
                    return # Stop processing
                    
        except queue.Empty:
            pass
            
        if self.is_scanning:
            self.after(100, self._process_scan_queue)

    def _add_songs_to_tree(self, songs):
        """Add a batch of songs to the treeview."""
        for song in songs:
            duration_str = self.format_duration(song['duration'])
            size_str = self.format_size(song['filesize'])
            tag_icon = self._get_tag_icon(song)
            
            self.tree.insert("", "end", values=(
                tag_icon,
                song['title'],
                song['artist'],
                duration_str,
                song['date'],
                size_str
            ), tags=(song['filepath'],))

    def refresh_library(self):
        """Scan download folder and populate tree."""
        if self.is_scanning:
            return
            
        # Clear current
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        self.all_songs = []
        
        # Update path from config
        self.download_path = self.config_manager.get("path", "")
        
        if not self.download_path or not os.path.exists(self.download_path):
            # Silent return if not set, or maybe just show empty
            return
            
        # Start scanning
        self.is_scanning = True
        self.refresh_btn.config(state="disabled", text="Scanning...")
        self.count_label.config(text="Scanning...")
        
        threading.Thread(target=self._scan_thread, daemon=True).start()
        self._process_scan_queue()
    
    def update_tree(self):
        """Update treeview with filtered songs."""
        # Clear existing
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Add songs
        self._add_songs_to_tree(self.filtered_songs)
    
    def on_search(self, *args):
        """Filter songs by search query."""
        query = self.search_var.get().lower()
        
        if not query:
            self.filtered_songs = self.all_songs.copy()
        else:
            self.filtered_songs = [
                song for song in self.all_songs
                if query in song['title'].lower() or query in song['artist'].lower()
            ]
        
        self.update_tree()
        self.count_label.config(text=f"{len(self.filtered_songs)} / {len(self.all_songs)} songs")
    
    def sort_column(self, col):
        """Sort tree by column."""
        # Toggle sort order
        if not hasattr(self, 'sort_reverse'):
            self.sort_reverse = {}
        
        reverse = self.sort_reverse.get(col, False)
        self.sort_reverse[col] = not reverse
        
        # Sort
        if col == "duration":
            self.filtered_songs.sort(key=lambda x: x['duration'], reverse=reverse)
        elif col == "size":
            self.filtered_songs.sort(key=lambda x: x['filesize'], reverse=reverse)
        elif col == "title":
            self.filtered_songs.sort(key=lambda x: x['title'], reverse=reverse)
        elif col == "artist":
            self.filtered_songs.sort(key=lambda x: x['artist'], reverse=reverse)
        elif col == "date":
            self.filtered_songs.sort(key=lambda x: x['date'], reverse=reverse)
        
        self.update_tree()
    
    def on_double_click(self, event):
        """Handle double-click on song."""
        self.play_selected()
    
    def play_selected(self):
        """Play the selected song (to be connected to player)."""
        selection = self.tree.selection()
        if not selection:
            return
        
        item = selection[0]
        filepath = self.tree.item(item)['tags'][0]
        
        # Find index in filtered_songs
        index = -1
        for i, song in enumerate(self.filtered_songs):
            if song['filepath'] == filepath:
                index = i
                break
        
        if index != -1:
            # Emit event with playlist data
            # We can't pass complex data via event string, so we'll use a callback or direct method
            # But since we are using bind, we need to pass data differently or change architecture
            # Let's use a custom event with a reference, or just call a method on parent if possible
            # Actually, main.py binds this. We can attach data to the widget temporarily
            self.current_playlist = self.filtered_songs
            self.current_index = index
            self.event_generate("<<PlaySong>>")
    
    def select_song(self, filepath):
        """Select song in tree by filepath."""
        if not filepath:
            return
            
        # Find item with matching tag
        # Since we don't have a direct map, we iterate. 
        # For large libraries this might be slow, but acceptable for now.
        for item in self.tree.get_children():
            item_tags = self.tree.item(item, "tags")
            if item_tags and item_tags[0] == filepath:
                self.tree.selection_set(item)
                self.tree.see(item)
                return

    def get_selected_filepath(self):
        """Get filepath of selected song."""
        selection = self.tree.selection()
        if not selection:
            return None
        
        item = selection[0]
        return self.tree.item(item)['tags'][0]
    
    def show_context_menu(self, event):
        """Show right-click context menu."""
        # Select the item under cursor
        item = self.tree.identify_row(event.y)
        if item:
            self.tree.selection_set(item)
            self.context_menu.post(event.x_root, event.y_root)
    
    def open_download_folder(self):
        """Open the main download directory."""
        path = self.config_manager.get("path", "")
        if path and os.path.exists(path):
            open_file(path)
        else:
            messagebox.showwarning("Error", "Download folder not set or does not exist.\nPlease configure it in the Downloader tab.")

    def show_about(self):
        """Show about dialog."""
        messagebox.showinfo("About SunoSync", 
            "SunoSync v2.0\n\n"
            "Your World, Your Music. Seamlessly Synced.\n\n"
            "Created by @InternetThot\n"
            "Buy me a coffee: buymeacoffee.com/audioalchemy")

    def open_folder(self):
        """Open folder containing selected song."""
        filepath = self.get_selected_filepath()
        if filepath:
            folder = os.path.dirname(filepath)
            open_file(folder)
    
    def edit_lyrics(self):
        """Open dialog to view/edit lyrics."""
        filepath = self.get_selected_filepath()
        if not filepath:
            return
            
        # Find song metadata from cache
        song_meta = next((s for s in self.all_songs if s['filepath'] == filepath), None)
        if not song_meta:
            return
            
        current_lyrics = song_meta.get('lyrics', '')
        
        # Create Dialog
        dialog = tk.Toplevel(self.winfo_toplevel())
        dialog.title(f"Lyrics: {song_meta['title']}")
        dialog.geometry("700x600") # Increased size
        dialog.configure(bg=self.bg_dark)
        dialog.transient(self.winfo_toplevel())
        
        # Buttons (Pack FIRST at BOTTOM to ensure visibility)
        btn_frame = tk.Frame(dialog, bg=self.bg_dark)
        btn_frame.pack(side=tk.BOTTOM, fill="x", padx=20, pady=20)
        
        def save():
            new_lyrics = text_area.get("1.0", "end-1c")
            success, message = save_lyrics_to_file(filepath, new_lyrics)
            if success:
                # Verify read-back
                try:
                    # Force fresh read from disk
                    meta = read_song_metadata(filepath)
                    saved_lyrics = meta.get('lyrics', '')
                    
                    # Normalize line endings for comparison
                    if saved_lyrics.replace('\r\n', '\n').strip() == new_lyrics.replace('\r\n', '\n').strip():
                        # Update cache
                        song_meta['lyrics'] = new_lyrics
                        messagebox.showinfo("Success", "Lyrics saved and verified on disk!")
                        dialog.destroy()
                    else:
                        messagebox.showwarning("Verification Failed", 
                            f"File saved but read-back failed.\n\n"
                            f"Expected length: {len(new_lyrics)}\n"
                            f"Actual on disk: {len(saved_lyrics)}\n\n"
                            f"File: {filepath}")
                except Exception as e:
                    messagebox.showerror("Verification Error", f"Error reading back file: {e}")
            else:
                messagebox.showerror("Error", f"Failed to save lyrics:\n{message}\n\nIf the song is playing, please STOP playback and try again.")
        
        save_btn = tk.Button(btn_frame, text="Save Lyrics", command=save,
                            bg=self.accent_purple, fg="white", font=("Segoe UI", 10, "bold"),
                            relief="flat", padx=20, pady=8, cursor="hand2")
        save_btn.pack(side=tk.RIGHT)
        
        cancel_btn = tk.Button(btn_frame, text="Cancel", command=dialog.destroy,
                              bg=self.bg_card, fg=self.fg_primary, font=("Segoe UI", 10),
                              relief="flat", padx=20, pady=8, cursor="hand2")
        cancel_btn.pack(side=tk.RIGHT, padx=10)

        # Text Area (Pack SECOND to fill remaining space)
        text_frame = tk.Frame(dialog, bg=self.bg_card, padx=2, pady=2)
        text_frame.pack(side=tk.TOP, fill="both", expand=True, padx=20, pady=(20, 0))
        
        text_area = tk.Text(text_frame, font=("Segoe UI", 11), bg=self.bg_input, 
                           fg=self.fg_primary, wrap="word", relief="flat",
                           insertbackground=self.fg_primary)
        text_area.pack(side=tk.LEFT, fill="both", expand=True)
        text_area.insert("1.0", current_lyrics)
        
        scrollbar = ttk.Scrollbar(text_frame, orient="vertical", command=text_area.yview)
        scrollbar.pack(side=tk.RIGHT, fill="y")
        text_area.config(yscrollcommand=scrollbar.set)

    def delete_selected(self):
        """Delete selected song."""
        filepath = self.get_selected_filepath()
        if not filepath:
            return
        
        if messagebox.askyesno("Delete", f"Delete this file?\n{os.path.basename(filepath)}"):
            try:
                os.remove(filepath)
                self.refresh_library()
                messagebox.showinfo("Deleted", "File deleted successfully")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to delete file:\n{e}")
    
    @staticmethod
    def format_duration(seconds):
        """Format duration as MM:SS."""
        if seconds == 0:
            return "--:--"
        mins = seconds // 60
        secs = seconds % 60
        return f"{mins}:{secs:02d}"
    
    @staticmethod
    def format_size(bytes):
        """Format file size."""
        if bytes == 0:
            return "0 KB"
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes < 1024.0:
                return f"{bytes:.1f} {unit}"
            bytes /= 1024.0
        
        return f"{bytes:.1f} TB"


if __name__ == "__main__":
    # Test the library tab standalone
    root = tk.Tk()
    root.title("Library Test")
    root.geometry("900x600")
    
    library = LibraryTab(root, download_path="Suno_Downloads")
    library.pack(fill="both", expand=True)
    
    root.mainloop()
