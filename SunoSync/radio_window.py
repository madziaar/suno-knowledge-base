import customtkinter as ctk
import threading
import time
from tkinter import messagebox
import webbrowser
import os

from radio_server import station, PLAYLIST_QUEUE

class RadioWindow(ctk.CTkToplevel):
    def __init__(self, parent):
        super().__init__(parent)
        
        self.title("Suno On-Air Station Manager")
        self.geometry("650x700")
        self.resizable(False, False)
        
        self.attributes("-topmost", True)
        self.after(100, lambda: self.attributes("-topmost", False))
        
        self._setup_ui()
        self._start_refresh_timer()
        
    def _setup_ui(self):
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.pack(fill="x", padx=20, pady=20)
        
        ctk.CTkLabel(header_frame, text="Suno On-Air", font=("Segoe UI", 28, "bold")).pack(side="left")
        
        self.status_badge = ctk.CTkLabel(header_frame, text="OFF AIR", 
                                       font=("Segoe UI", 14, "bold"),
                                       fg_color="#cf2e2e", 
                                       text_color="white",
                                       corner_radius=6,
                                       height=28,
                                       width=80)
        self.status_badge.pack(side="right")
        
        # Control
        control_frame = ctk.CTkFrame(self)
        control_frame.pack(fill="x", padx=20, pady=(0, 20))
        
        self.btn_broadcast = ctk.CTkButton(control_frame, 
                                         text="Start Broadcast",
                                         font=("Segoe UI", 16, "bold"),
                                         fg_color="#bb86fc", text_color="black",
                                         hover_color="#a370db",
                                         command=self.toggle_broadcast)
        self.btn_broadcast.pack(side="left", padx=20, pady=20)
        
        self.link_btn = ctk.CTkButton(control_frame, text="Link not available", state="disabled",
                                      fg_color="transparent", text_color="gray", width=300, anchor="w",
                                      command=self.copy_link)
        self.link_btn.pack(side="left", padx=10)
        
        # Queue
        ctk.CTkLabel(self, text="Live Requests Queue", font=("Segoe UI", 18, "bold")).pack(anchor="w", padx=20, pady=(0, 10))
        
        self.queue_frame = ctk.CTkScrollableFrame(self, height=400)
        self.queue_frame.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        
        # Current Track
        self.current_frame = ctk.CTkFrame(self, fg_color="#18181b", height=80)
        self.current_frame.pack(fill="x", side="bottom")
        
        self.lbl_now_playing = ctk.CTkLabel(self.current_frame, text="Now Playing: None", font=("Segoe UI", 14, "bold"))
        self.lbl_now_playing.pack(side="left", padx=20, pady=(15, 0), anchor="nw")
        
        self.lbl_played_by = ctk.CTkLabel(self.current_frame, text="", font=("Segoe UI", 12), text_color="gray")
        self.lbl_played_by.place(x=20, y=45)
        
        self.btn_skip = ctk.CTkButton(self.current_frame, text="Skip Next", width=80, fg_color="#333", command=self.skip_track)
        self.btn_skip.pack(side="right", padx=20, pady=25)

    def copy_link(self):
        link = self.link_btn.cget("text").replace("🔗 Copy Link: ", "")
        self.clipboard_clear()
        self.clipboard_append(link)
        messagebox.showinfo("Copied", "Link copied to clipboard!")

    def toggle_broadcast(self):
        if not station.running:
            self.btn_broadcast.configure(state="disabled", text="Starting...")
            
            # Configure Library Path from App Settings
            try:
                # Access ConfigManager from the main app (self.master)
                # Note: self.master is typically the SunoSyncApp instance
                download_path = self.master.config_manager.get("download_path")
                if download_path:
                    station.set_library_path(download_path)
            except Exception as e:
                print(f"Error setting radio path: {e}")
                
            def run_start():
                url = station.start_broadcast()
                self.after(0, lambda: self.on_broadcast_started(url))
            threading.Thread(target=run_start).start()
        else:
            station.stop_broadcast()
            self.on_broadcast_stopped()
            
    def on_broadcast_started(self, url):
        self.btn_broadcast.configure(state="normal", text="Stop Broadcast", fg_color="#cf2e2e", hover_color="#b02626")
        self.status_badge.configure(text="LIVE", fg_color="#2ecf57")
        
        self.link_btn.configure(state="normal", text=f"🔗 Copy Link: {url}", fg_color="#27272a", text_color="#3b8ed0")
        
    def on_broadcast_stopped(self):
        self.btn_broadcast.configure(state="normal", text="Start Broadcast", fg_color="#bb86fc", hover_color="#a370db")
        self.status_badge.configure(text="OFF AIR", fg_color="#cf2e2e")
        
        self.link_btn.configure(state="disabled", text="Broadcast stopped.", fg_color="transparent", text_color="gray")

    def skip_track(self):
        station.skip_event.set()

    def _start_refresh_timer(self):
        self.refresh_queue()
        self.refresh_current()
        self.after(2000, self._start_refresh_timer)
        
    def refresh_current(self):
        import radio_server
        track = radio_server.CURRENT_TRACK
        if track:
            # track is now a dict
            self.lbl_now_playing.configure(text=f"Now Playing: {track['title'][:35]}")
            self.lbl_played_by.configure(text=f"Requested by: {track['user']}")
        else:
            self.lbl_now_playing.configure(text="Now Playing: None")
            self.lbl_played_by.configure(text="")

    def refresh_queue(self):
        for widget in self.queue_frame.winfo_children():
            widget.destroy()
            
        if not PLAYLIST_QUEUE:
            ctk.CTkLabel(self.queue_frame, text="Queue is empty. Waiting for uploads...", text_color="gray").pack(pady=20)
            return

        for i, item in enumerate(PLAYLIST_QUEUE):
            # item is dict {path, user, title}
            row = ctk.CTkFrame(self.queue_frame, fg_color="transparent")
            row.pack(fill="x", pady=2)
            
            # Info
            info_text = f"{i+1}. {item['title']}\n    (by {item['user']})"
            ctk.CTkLabel(row, text=info_text, anchor="w", justify="left").pack(side="left", padx=10, fill="x", expand=True)
            
            # Buttons
            ctk.CTkButton(row, text="Play Now", width=70, height=24, fg_color="#3b8ed0",
                        command=lambda idx=i: self.play_now(idx)).pack(side="right", padx=5)
            
            ctk.CTkButton(row, text="Kick", width=50, height=24, fg_color="#cf2e2e", 
                        command=lambda idx=i: self.kick_track(idx)).pack(side="right", padx=5)
                        
    def kick_track(self, index):
        if 0 <= index < len(PLAYLIST_QUEUE):
            PLAYLIST_QUEUE.pop(index)
            self.refresh_queue()
            
    def play_now(self, index):
        station.play_track_at(index)
        # Visual feedback?
        messagebox.showinfo("SunoRadio", "Track set to play next (skipping current).")
