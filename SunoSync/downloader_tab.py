import os
import sys
import threading
import queue
import customtkinter as ctk
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk

# Helpers and Widgets
from suno_utils import truncate_path
from suno_widgets import SongCard, WorkspaceBrowser, FilterPopup, EmptyStateWidget
from suno_layout import create_token_dialog
from suno_downloader import SunoDownloader
from tooltip import ToolTip

# Stdout Capture for Debug Log
class StdoutCapture:
    def __init__(self, tab_instance):
        self.tab = tab_instance
        try:
            self.original_stdout = sys.stdout if sys.stdout else sys.__stdout__
        except:
            self.original_stdout = sys.__stdout__
        self.buffer = ""
    
    def write(self, text):
        try:
            if self.original_stdout:
                self.original_stdout.write(text)
                self.original_stdout.flush()
        except:
            pass
        
        if text:
            self.tab.add_debug_log(text)

    def flush(self):
        try:
            if self.original_stdout:
                self.original_stdout.flush()
        except:
            pass

class DownloaderTab(ctk.CTkFrame):
    def __init__(self, parent, config_manager, **kwargs):
        super().__init__(parent, fg_color="transparent", **kwargs)
        
        self.config_manager = config_manager
        self.downloader = SunoDownloader()
        
        # State
        self.gui_queue = queue.Queue()
        self.queue_items = {} # uuid -> SongCard
        self.preloaded_songs = {} # uuid -> meta
        self.is_preloaded = False
        self.filter_settings = {}
        self.debug_logs = []
        self.debug_window = None
        
        # Theme Attributes
        self.card_bg = "#27272a"
        
        # Debug Log Capture
        sys.stdout = StdoutCapture(self)
        
        # Initialize Variables manually (since generic settings card is moved)
        self.init_variables()
        
        # UI Setup
        self._setup_layout()
        self.load_config()
        
        # Start GUI Loop
        self.after(100, self._process_gui_queue)
        
        # Initial checks
        self.after(500, self.check_initial_path)

    def _setup_layout(self):
        # --- Root Layout ---
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1) # List expands (Row 2 now)
        
        # --- 1. Settings Header (3-Column Grid) ---
        self.header_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.header_frame.grid(row=0, column=0, sticky="ew", padx=10, pady=10)
        
        self.header_frame.grid_columnconfigure(0, weight=1)
        self.header_frame.grid_columnconfigure(1, weight=1)
        self.header_frame.grid_columnconfigure(2, weight=1)
        
        # --- Left Panel: Connection ---
        conn_frame = ctk.CTkFrame(self.header_frame)
        conn_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 5), pady=5)
        
        ctk.CTkLabel(conn_frame, text="Connection", font=("Segoe UI", 12, "bold")).pack(anchor="w", padx=10, pady=(5,0))
        
        conn_inner = ctk.CTkFrame(conn_frame, fg_color="transparent")
        conn_inner.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(conn_inner, text="Suno Cookie", font=("Segoe UI", 11)).pack(anchor="w")
        
        self.token_var = ctk.StringVar()
        entry_row = ctk.CTkFrame(conn_inner, fg_color="transparent")
        entry_row.pack(fill="x", pady=(2, 5))
        
        self.token_entry = ctk.CTkEntry(entry_row, textvariable=self.token_var, show="●", height=28)
        self.token_entry.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        ctk.CTkButton(entry_row, text="Get Token", command=self.get_token_logic, width=80, height=28, 
                      fg_color="#333", hover_color="#444").pack(side="right")

        # --- Center Panel: Scan Settings ---
        scan_frame = ctk.CTkFrame(self.header_frame)
        scan_frame.grid(row=0, column=1, sticky="nsew", padx=5, pady=5)
        
        ctk.CTkLabel(scan_frame, text="Scan Settings", font=("Segoe UI", 12, "bold")).pack(anchor="w", padx=10, pady=(5,0))
        
        scan_inner = ctk.CTkFrame(scan_frame, fg_color="transparent")
        scan_inner.pack(fill="x", padx=10, pady=5)
        
        self.rate_limit_var = ctk.DoubleVar(value=0.5)
        self.start_page_var = ctk.IntVar(value=1)
        self.max_pages_var = ctk.IntVar(value=0)

        # Grid for inputs
        scan_inner.grid_columnconfigure(3, weight=1) # Filler column to preventing stretching
        
        # Speed
        lbl_speed = ctk.CTkLabel(scan_inner, text="Speed (Delay):", font=("Segoe UI", 11), text_color="gray")
        lbl_speed.grid(row=0, column=0, sticky="w", pady=2)
        ent_speed = ctk.CTkEntry(scan_inner, textvariable=self.rate_limit_var, width=60, height=24)
        ent_speed.grid(row=0, column=1, sticky="w", padx=5, pady=2)
        ctk.CTkLabel(scan_inner, text="s", font=("Segoe UI", 11), text_color="gray").grid(row=0, column=2, sticky="w")
        ToolTip(lbl_speed, "Time to wait between API requests. Increase if downloads fail.")

        # Start Page
        lbl_page = ctk.CTkLabel(scan_inner, text="Start Page:", font=("Segoe UI", 11), text_color="gray")
        lbl_page.grid(row=1, column=0, sticky="w", pady=2)
        ent_page = ctk.CTkEntry(scan_inner, textvariable=self.start_page_var, width=60, height=24)
        ent_page.grid(row=1, column=1, sticky="w", padx=5, pady=2)
        ToolTip(lbl_page, "Which page of your library to start scanning from.")
        
        # Limit
        lbl_limit = ctk.CTkLabel(scan_inner, text="Max Pages:", font=("Segoe UI", 11), text_color="gray")
        lbl_limit.grid(row=2, column=0, sticky="w", pady=2)
        ctk.CTkEntry(scan_inner, textvariable=self.max_pages_var, width=60, height=24).grid(row=2, column=1, sticky="w", padx=5, pady=2)
        ToolTip(lbl_limit, "Limit how many pages to scan (0 = unlimited).")

        # --- Right Panel: Target ---
        target_frame = ctk.CTkFrame(self.header_frame)
        target_frame.grid(row=0, column=2, sticky="nsew", padx=(5, 0), pady=5)
        
        ctk.CTkLabel(target_frame, text="Target", font=("Segoe UI", 12, "bold")).pack(anchor="w", padx=10, pady=(5,0))
        
        target_inner = ctk.CTkFrame(target_frame, fg_color="transparent")
        target_inner.pack(fill="x", padx=10, pady=5)
        
        self.filter_btn = ctk.CTkButton(target_inner, text="Filters", command=self.open_filters, height=24, 
                                        fg_color="transparent", border_width=1, border_color="gray", text_color="gray")
        self.filter_btn.pack(fill="x", pady=2)
        
        self.workspace_btn = ctk.CTkButton(target_inner, text="Workspaces", command=self.open_workspaces, height=24,
                                           fg_color="transparent", border_width=1, border_color="gray", text_color="gray")
        self.workspace_btn.pack(fill="x", pady=2)

        self.playlist_btn = ctk.CTkButton(target_inner, text="Playlists", command=self.open_playlists, height=24,
                                          fg_color="transparent", border_width=1, border_color="gray", text_color="gray")
        self.playlist_btn.pack(fill="x", pady=2)


        # --- 2. Action Bar (Row 1) ---
        action_frame = ctk.CTkFrame(self, fg_color="transparent")
        action_frame.grid(row=1, column=0, sticky="ew", padx=10, pady=(0, 10))
        
        # Spacer check? No, just removing the top util row.
        # Main Buttons
        btn_inner = ctk.CTkFrame(action_frame, fg_color="transparent")
        btn_inner.pack(fill="x")
        
        self.preload_btn = ctk.CTkButton(btn_inner, text="Preload List", command=self.preload_songs, 
                                         height=36, fg_color="transparent", border_width=1, border_color="#555", 
                                         text_color="gray", hover_color="#333", font=("Segoe UI", 13, "bold"))
        self.preload_btn.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        self.start_btn = ctk.CTkButton(btn_inner, text="Start Download", command=self.start_download_thread,
                                       height=36, fg_color="#7c3aed", hover_color="#6d28d9", font=("Segoe UI", 13, "bold"))
        self.start_btn.pack(side="left", fill="x", expand=True, padx=(5, 5))
        
        self.stop_btn = ctk.CTkButton(btn_inner, text="Stop", command=self.stop_download,
                                      height=36, width=80, fg_color="#ef4444", hover_color="#b91c1c", font=("Segoe UI", 13, "bold"))
        self.stop_btn.pack(side="right")
        self.stop_btn.configure(state="disabled")

        # --- 3. Song List (Row 2) ---
        self.queue_list_frame = ctk.CTkScrollableFrame(self, fg_color="#18181b") 
        self.queue_list_frame.grid(row=2, column=0, sticky="nsew", padx=10, pady=5)
        
        # Empty State
        self.empty_state = EmptyStateWidget(self.queue_list_frame, theme={})
        self.empty_state.pack(fill="both", expand=True, pady=40)
        
        # --- 4. Footer (Row 3) ---
        footer = ctk.CTkFrame(self, fg_color="transparent")
        footer.grid(row=3, column=0, sticky="ew", padx=10, pady=(0, 10))
        
        self.status_label = ctk.CTkLabel(footer, text="Ready", text_color="#10b981", font=("Segoe UI", 11))
        self.status_label.pack(side="left")
        
        self.progress_bar = ctk.CTkProgressBar(footer, height=6)
        self.progress_bar.pack(side="right", fill="x", expand=True, padx=(10, 0))
        self.progress_bar.set(0)

    def init_variables(self):
        # Variables specific to Downloader Tab
        # Shared settings (Path, Toggles) are now managed solely by SettingsTab and ConfigManager
        pass
        
    def load_config(self):
        c = self.config_manager
        # Variables were created by layout helpers
        if hasattr(self, 'token_var'): self.token_var.set(c.get("token", ""))
        
        # Variables were created by layout helpers
        if hasattr(self, 'token_var'): self.token_var.set(c.get("token", ""))
        
        # Shared Settings are not loaded into local vars anymore to avoid conflicts
        # They are read directly from config_manager when needed.

        # Inputs
        if hasattr(self, 'rate_limit_var'): self.rate_limit_var.set(c.get("download_delay", 0.5))
        if hasattr(self, 'max_pages_var'): self.max_pages_var.set(c.get("max_pages", 0))
        if hasattr(self, 'start_page_var'): self.start_page_var.set(c.get("start_page", 1))
        
        # Filters
        self.filter_settings = c.get("filter_settings", {})
        self._update_filter_btn_text()
        
        # Restore Workspace/Playlist Button Text
        ws_name = self.filter_settings.get("workspace_name")
        ws_type = self.filter_settings.get("type")
        
        if ws_name:
            if ws_type == "workspace":
                 if hasattr(self, 'workspace_btn'): self.workspace_btn.configure(text=truncate_path(ws_name, 12))
            elif ws_type == "playlist":
                 if hasattr(self, 'playlist_btn'): self.playlist_btn.configure(text=truncate_path(ws_name, 12))

    def save_config(self):
        c = self.config_manager
        if hasattr(self, 'token_var'): c.set("token", self.token_var.get())
        # Do NOT save shared settings here (path, toggles) - let SettingsTab handle them

        
        if hasattr(self, 'rate_limit_var'): c.set("download_delay", self.rate_limit_var.get())
        if hasattr(self, 'max_pages_var'): c.set("max_pages", self.max_pages_var.get())
        if hasattr(self, 'start_page_var'): c.set("start_page", self.start_page_var.get())
        
        c.set("filter_settings", self.filter_settings)
        c.save_config()

    # --- Actions ---
    def get_token_logic(self):
        create_token_dialog(self) # Helper from suno_layout
        
    def browse_folder(self):
        path = tk.filedialog.askdirectory(initialdir=self.path_var.get())
        if path:
            self.path_var.set(path)
            if hasattr(self, 'path_display_var'): self.path_display_var.set(truncate_path(path))
            self.save_config()

    def open_filters(self):
        FilterPopup(self, self.filter_settings, self.on_filters_applied)

    def on_filters_applied(self, new_filters):
        self.filter_settings.update(new_filters)
        self._update_filter_btn_text()
        self.save_config()

    def _update_filter_btn_text(self):
        if hasattr(self, 'filter_btn'):
            count = sum(1 for v in self.filter_settings.values() if v is True)
            self.filter_btn.configure(text=f"Filters ({count})")

    def open_workspaces(self):
        self.log("Fetching workspaces...")
        token = self.token_var.get()
        threading.Thread(target=lambda: self._fetch_browser_items(token, "workspaces"), daemon=True).start()

    def open_playlists(self):
        self.log("Fetching playlists...")
        token = self.token_var.get()
        threading.Thread(target=lambda: self._fetch_browser_items(token, "playlists"), daemon=True).start()
    
    def _fetch_browser_items(self, token, mode):
        # Fetch items
        items = []
        try:
            if mode == "workspaces":
                items = self.downloader.fetch_workspaces(token)
            else:
                items = self.downloader.fetch_playlists(token)
            
            self.after(0, lambda: self._show_browser(items, mode))
        except Exception as e:
            self.log(f"Error fetching {mode}: {e}")

    def _show_browser(self, items, mode):
        def on_select(item):
            # Update filter settings
            self.filter_settings["workspace_id"] = item.get("id")
            self.filter_settings["workspace_name"] = item.get("name")
            self.filter_settings["type"] = "playlist" if mode == "playlists" else "workspace"
            
            self.save_config()
            
            name = item.get("name") or "Selected"
            
            # Update appropriate button and reset the other
            if mode == "workspaces":
                self.workspace_btn.configure(text=truncate_path(name, 12))
                self.playlist_btn.configure(text="Playlists")
            else:
                self.playlist_btn.configure(text=truncate_path(name, 12))
                self.workspace_btn.configure(text="Workspaces")
            
            messagebox.showinfo("Selected", f"Selected {mode[:-1]}: {name}")

        WorkspaceBrowser(self, items, on_select, title=f"Select {mode.capitalize()[:-1]}")

    def preload_songs(self):
        if not self.token_var.get():
            messagebox.showwarning("Error", "No token set")
            return
            
        self.is_preloaded = True
        self.preloaded_songs.clear()
        self.clear_queue()
        
        self.update_status("Scanning...", "busy")
        self.toggle_inputs(False) # Enable Stop button
        self.save_config()
        
        # Configure downloader for SCAN ONLY
        self._configure_downloader(scan_only=True)
        
        # Connect signals (Required for UI updates)
        self.downloader.signals.download_complete.connect(self.on_download_complete)
        self.downloader.signals.song_found.connect(self.on_song_found)
        self.downloader.signals.song_started.connect(self.on_song_started)
        self.downloader.signals.song_updated.connect(self.on_song_updated)
        self.downloader.signals.song_finished.connect(self.on_song_finished)
        self.downloader.signals.status_changed.connect(lambda msg: self.update_status(msg, "busy"))
        self.downloader.signals.log_message.connect(lambda msg, type, _: self.log(msg, type))
        
        threading.Thread(target=self.downloader.run, daemon=True).start()

    def clear_uuid_cache(self):
        try:
             # Just delete the cache file if it exists
            # We need to access library_cache.json path. It's not stored in config, but main passes it.
            # Wait, DownloaderTab doesn't know about cache file path directly unless passed.
            # But the user said "clear cache button to reset UUID cache". That usually means the internal memory cache or the file.
            # Let's assume they mean preventing duplicates.
            
            # Reset internal preloaded songs
            self.preloaded_songs.clear()
            self.clear_queue()
            self.preloaded_songs.clear()
            self.clear_queue()
            messagebox.showinfo("Cache Cleared", "Queue cleared.\nDownload history is based on files in the current folder.\nTo re-download existing songs, enable 'Force Rescan'.")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def start_download_thread(self):
        self.save_config()
        
        target_list = []
        if self.is_preloaded:
            # Collect checked items
            for uuid, card in self.queue_items.items():
                if card.selected_var.get():
                    # We need metadata. preloaded_songs has it.
                    if uuid in self.preloaded_songs:
                        target_list.append(self.preloaded_songs[uuid])
            
            if not target_list and self.queue_items:
                 messagebox.showinfo("Info", "No songs selected.")
                 return

        self.update_status("Downloading...", "busy")
        self.toggle_inputs(False)
        
        if not self.is_preloaded:
            self.clear_queue()
        
        # Configure downloader
        # If is_preloaded is True, we pass the specific list.
        # If False, we pass None (or empty list) which triggers full scan/download.
        self._configure_downloader(scan_only=False)
        if target_list:
            self.downloader.config["target_songs"] = target_list
            # Disable page limits if we are targeting specific songs (optional, but safer)
            # self.downloader.config["max_pages"] = 0 
        
        # Connect signals
        self.downloader.signals.download_complete.connect(self.on_download_complete)
        self.downloader.signals.song_found.connect(self.on_song_found)
        self.downloader.signals.song_started.connect(self.on_song_started)
        self.downloader.signals.song_updated.connect(self.on_song_updated)
        self.downloader.signals.song_finished.connect(self.on_song_finished)
        self.downloader.signals.progress_updated.connect(self.on_progress_updated)
        
        threading.Thread(target=self.downloader.run, daemon=True).start()
        
    def on_progress_updated(self, percent):
        self.gui_queue.put(("progress", percent))

    def stop_download(self):
        self.downloader.stop()
        self.update_status("Stopping...", "busy")
        self.stop_btn.configure(state="disabled", text="Stopping...")
        
        # Ensure inputs re-enable after a moment if thread doesn't callback fast enough
        # But correctly, the thread should finish and call on_download_complete
        # which calls toggle_inputs(True).
        # We'll rely on on_download_complete, but force a check.
        self.after(2000, lambda: self.check_stop_status())
        
    def check_stop_status(self):
        if not self.downloader.is_stopped() and self.start_btn._state == "disabled":
             # Still waiting? 
             pass
        else:
             # Just in case
             if self.start_btn._state == "disabled" and not self.downloader.is_stopped(): 
                 # This means thread might have died silently?
                 pass
             elif self.start_btn._state == "disabled":
                 # Re-enable if stuck
                 self.toggle_inputs(True)
                 self.update_status("Stopped", "normal")

    def _configure_downloader(self, scan_only):
        c = self.config_manager
        base_path = os.getcwd()
        default_path = os.path.join(base_path, "Suno_Downloads")
            
        self.downloader.configure(
            token=self.token_var.get(),
            directory=c.get("path", default_path),
            max_pages=self.max_pages_var.get(),
            start_page=max(1, self.start_page_var.get()), # Enforce minimum 1
            organize_by_month=c.get("organize", False),
            embed_metadata_enabled=c.get("embed_metadata", True),
            save_lyrics=c.get("save_lyrics", True),
            prefer_wav=c.get("prefer_wav", False),
            download_delay=self.rate_limit_var.get(),
            filter_settings=self.filter_settings,
            organize_by_track=c.get("track_folder", False),
            smart_resume=c.get("smart_resume", False),
            scan_only=scan_only,
            force_rescan=c.get("force_rescan", False),
            organize_by_playlist=c.get("playlist_folder", False)
        )

    # --- GUI Queue Processing ---
    def _process_gui_queue(self):
        try:
            # Process up to 50 items at a time to keep UI responsive
            count = 0
            while not self.gui_queue.empty() and count < 50:
                msg = self.gui_queue.get_nowait()
                action = msg[0]
                if action == "status":
                    self.status_label.configure(text=msg[1], text_color=msg[2])
                elif action == "add_song":
                    self._add_song_card(msg[1])
                elif action == "update_song":
                    self._update_song_card(msg[1], msg[2], msg[3])
                elif action == "progress":
                    # Update main progress bar
                    percent = msg[1]
                    self.progress_bar.set(percent / 100.0)
                elif action == "log":
                    text = msg[1]
                    self.debug_logs.append(text)
                    # Limit log size
                    if len(self.debug_logs) > 1000:
                        self.debug_logs = self.debug_logs[-800:]
                        
                    if self.debug_window and self.debug_text:
                        self.debug_text.insert("end", text + "\n")
                        if count % 10 == 0: # Auto-scroll occasionally
                            self.debug_text.see("end")
                            
                count += 1
        except queue.Empty:
            pass
        except Exception:
            pass
            
        self.after(50, self._process_gui_queue)

    def update_status(self, text, state="normal"):
        colors = {"normal": "#10b981", "busy": "#8b5cf6", "error": "#ef4444"}
        self.gui_queue.put(("status", text, colors.get(state, "gray")))

    def log(self, text, level="info"):
        self.gui_queue.put(("log", text))

    def add_debug_log(self, text):
        self.log(text.strip())

    def on_song_found(self, metadata):
        self.gui_queue.put(("add_song", metadata))

    def _add_song_card(self, metadata):
        uuid = metadata.get("id")
        if uuid in self.queue_items: return
        
        card = SongCard(self.queue_list_frame, uuid, metadata.get("title", "Unknown"), 
                        metadata=metadata, bg_color="#27272a") # Zinc 800
        card.pack(fill="x", pady=2, padx=5)
        self.queue_items[uuid] = card
        
        # Hide empty state when first song is added
        if hasattr(self, 'empty_state') and self.empty_state.winfo_exists():
            self.empty_state.pack_forget()
        
        if self.is_preloaded:
            self.preloaded_songs[uuid] = metadata

        # Fetch thumb?
        if metadata.get("image_url"):
             self.fetch_thumb(uuid, metadata.get("image_url"))

    def fetch_thumb(self, uuid, url):
        threading.Thread(target=lambda: self._fetch_thumb_thread(uuid, url), daemon=True).start()

    def _fetch_thumb_thread(self, uuid, url):
        data = self.downloader.fetch_thumbnail_bytes(url)
        if data:
            self.after(0, lambda: self._set_card_thumb(uuid, data))

    def _set_card_thumb(self, uuid, data):
        if uuid in self.queue_items:
             self.queue_items[uuid].set_thumbnail(data)

    def on_song_started(self, uuid, title, thumb_data, metadata):
        # We need to ensure the card exists
        self.after(0, lambda: self._add_song_card(metadata))
        self.gui_queue.put(("update_song", uuid, "Downloading", 0))

    def on_song_updated(self, uuid, status, progress):
        self.gui_queue.put(("update_song", uuid, status, progress))

    def on_song_finished(self, uuid, success, filepath):
        status = "Complete" if success else "Error"
        progress = 100 if success else 0
        self.gui_queue.put(("update_song", uuid, status, progress))

    def _update_song_card(self, uuid, status, progress):
        if uuid in self.queue_items:
            self.queue_items[uuid].set_status(status, progress)

    def on_download_complete(self, success):
        self.toggle_inputs(True)
        self.update_status("Complete" if success else "Stopped", "normal" if success else "error")

    def toggle_inputs(self, enable):
        state = "normal" if enable else "disabled"
        if hasattr(self, 'start_btn'): 
            self.start_btn.configure(state=state)
            self.start_btn.configure(text="Start Download" if enable else "Downloading...")
        if hasattr(self, 'preload_btn'):
            self.preload_btn.configure(state=state)
        if hasattr(self, 'stop_btn'): 
            self.stop_btn.configure(state="disabled" if enable else "normal", text="Stop")
    
    def clear_queue(self):
        for w in self.queue_list_frame.winfo_children():
            w.destroy()
        self.queue_items.clear()
        
        # Re-add empty state
        self.empty_state = EmptyStateWidget(self.queue_list_frame, theme={})
        self.empty_state.pack(fill="both", expand=True, pady=40)
        
    def _add_song_card(self, metadata):
        try:
            # Remove empty state if present
            if hasattr(self, 'empty_state') and self.empty_state.winfo_exists():
                self.empty_state.destroy()
                
            uuid = metadata.get("id")
            if uuid in self.queue_items: return
            
            # Verify frame exists
            if not self.queue_list_frame.winfo_exists():
                print("Error: Queue list frame does not exist!")
                return

            card = SongCard(self.queue_list_frame, uuid, metadata.get("title", "Unknown"), 
                            metadata=metadata, bg_color="#27272a") # Zinc 800
            card.pack(fill="x", pady=2, padx=5)
            self.queue_items[uuid] = card
            
            if self.is_preloaded:
                self.preloaded_songs[uuid] = metadata

            # Fetch thumb?
            if metadata.get("image_url"):
                 self.fetch_thumb(uuid, metadata.get("image_url"))
        except Exception as e:
            print(f"Error adding song card: {e}")
            self.log(f"UI Error: Failed to add card: {e}", "error")
        
    def open_debug_window(self):
        if self.debug_window and self.debug_window.winfo_exists():
            self.debug_window.lift()
            return
            
        self.debug_window = ctk.CTkToplevel(self)
        self.debug_window.title("Debug Log")
        self.debug_window.geometry("800x600")
        
        self.debug_text = ctk.CTkTextbox(self.debug_window, font=("Consolas", 12))
        self.debug_text.pack(fill="both", expand=True, padx=10, pady=10)
        
        for l in self.debug_logs:
            self.debug_text.insert("end", l + "\n")
            
    def check_initial_path(self):
         if not hasattr(self, 'path_var'):
             self.init_variables()
         if not self.path_var.get():
             pass # Optional prompt?
             
    def on_close(self):
        self.downloader.stop()
