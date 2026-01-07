import tkinter as tk
import customtkinter as ctk
from PIL import Image
from io import BytesIO
import os

def hex_to_rgb(value):
    value = value.lstrip('#')
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4))

class CollapsibleCard(ctk.CTkFrame):
    def __init__(self, parent, title, bg_color=None, corner_radius=12, padding=10, collapsed=True, **kwargs):
        super().__init__(parent, corner_radius=corner_radius, fg_color=bg_color, **kwargs)
        self.title = title
        self.collapsed = collapsed
        self.bg_color = bg_color
        self.padding = padding
        
        self.header_btn = ctk.CTkButton(
            self, 
            text=f"▶ {title}" if collapsed else f"▼ {title}", 
            command=self.toggle,
            fg_color="transparent", 
            hover_color=("gray75", "gray25"),
            anchor="w",
            font=("Segoe UI", 11, "bold"),
            height=30
        )
        self.header_btn.pack(fill="x", padx=5, pady=5)
        
        self.body = ctk.CTkFrame(self, fg_color="transparent")
        
        if not collapsed:
            self.body.pack(fill="both", expand=True, padx=padding, pady=(0, padding))
            
    def toggle(self):
        self.collapsed = not self.collapsed
        if self.collapsed:
            self.body.pack_forget()
            self.header_btn.configure(text=f"▶ {self.title}")
        else:
            self.body.pack(fill="both", expand=True, padx=self.padding, pady=(0, self.padding))
            self.header_btn.configure(text=f"▼ {self.title}")

    def set_summary(self, text):
        pass


class SongCard(ctk.CTkFrame):
    def __init__(self, parent, uuid, title, thumbnail_data=None, metadata=None, bg_color="transparent", show_checkbox=True, **kwargs):
        super().__init__(parent, fg_color=bg_color, **kwargs)
        self.uuid = uuid
        self.metadata = metadata or {}
        self.filepath = None
        
        self.columnconfigure(2, weight=1)
        
        self.selected_var = ctk.BooleanVar(value=True)
        self.checkbox = None
        
        if show_checkbox:
            self.checkbox = ctk.CTkCheckBox(self, text="", variable=self.selected_var, width=24, height=24)
            self.checkbox.grid(row=0, column=0, rowspan=2, padx=(10, 5), pady=10)
        else:
             # Spacer to align if needed, or just nothing
             pass
        
        self.thumb_label = ctk.CTkLabel(self, text="♫", width=48, height=48, fg_color=("gray80", "gray20"))
        self.thumb_label.grid(row=0, column=1, rowspan=2, padx=5, pady=5)
        
        if thumbnail_data:
            self.set_thumbnail(thumbnail_data)
            
        display_title = title if len(title) < 40 else title[:37] + "..."
        self.title_label = ctk.CTkLabel(self, text=display_title, font=("Segoe UI", 14, "bold"), anchor="w")
        self.title_label.grid(row=0, column=2, sticky="ew", padx=5, pady=(5, 0))
        
        tags = self.metadata.get("tags", "Unknown Genre")
        display_tags = tags if len(tags) < 50 else tags[:47] + "..."
        self.subtitle_label = ctk.CTkLabel(self, text=display_tags, font=("Segoe UI", 12), text_color="gray", anchor="w")
        self.subtitle_label.grid(row=1, column=2, sticky="ew", padx=5, pady=(0, 5))
        
        self.status_label = ctk.CTkLabel(self, text="Waiting", font=("Segoe UI", 12))
        self.status_label.grid(row=0, column=3, padx=10, pady=5, sticky="e")
        
        self.progress_bar = ctk.CTkProgressBar(self, width=100)
        
        self.action_btn = ctk.CTkButton(self, text="▶", width=30, height=30, fg_color="transparent", command=self.on_action)

    def set_thumbnail(self, data):
        if not self.winfo_exists(): return
        try:
            image = Image.open(BytesIO(data))
            image = ctk.CTkImage(light_image=image, dark_image=image, size=(48, 48))
            self.thumb_label.configure(image=image, text="")
        except Exception:
            pass

    def set_status(self, status, progress=None):
        if not self.winfo_exists(): return
        self.status_label.configure(text=status)
        if status == "Downloading":
            self.status_label.configure(text_color=("blue", "#3b82f6"))
            self.progress_bar.grid(row=1, column=3, padx=10, sticky="e")
            if progress is not None:
                self.progress_bar.set(progress / 100)
        elif status == "Complete":
            self.status_label.configure(text_color=("green", "#22c55e"))
            self.progress_bar.grid_forget()
            self.action_btn.grid(row=0, column=4, rowspan=2, padx=5)
        elif status == "Error":
            self.status_label.configure(text_color=("red", "#ef4444"))
            self.progress_bar.grid_forget()
        else:
            self.status_label.configure(text_color="gray")
            self.progress_bar.grid_forget()
            self.action_btn.grid_forget()

    def set_filepath(self, path):
        self.filepath = path

    def on_action(self):
        if self.filepath and os.path.exists(self.filepath):
            try:
                os.startfile(self.filepath)
            except: pass

    def is_selected(self):
        return self.selected_var.get()


class DownloadQueuePane(ctk.CTkScrollableFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        self.cards = {}
        
    def add_song(self, uuid, title, thumbnail_data=None, metadata=None):
        if uuid in self.cards: 
            return
        
        card = SongCard(self, uuid, title, thumbnail_data, metadata)
        card.pack(fill="x", pady=2, padx=5)
        self.cards[uuid] = card
        
    def update_song(self, uuid, status=None, progress=None, filepath=None):
        if uuid in self.cards:
            if status: self.cards[uuid].set_status(status, progress)
            if filepath: self.cards[uuid].set_filepath(filepath)

    def update_thumbnail(self, uuid, data):
        if uuid in self.cards:
            self.cards[uuid].set_thumbnail(data)
            
    def clear(self):
        for card in self.cards.values():
            card.destroy()
        self.cards.clear()

    def get_selected_uuids(self):
        return [uuid for uuid, card in self.cards.items() if card.is_selected()]


class FilterPopup(ctk.CTkToplevel):
    def __init__(self, parent, current_filters, on_apply, active_workspace_name=None):
        super().__init__(parent)
        self.title("Filters")
        self.geometry("400x700")
        self.on_apply = on_apply
        self.current_filters = current_filters
        self.active_workspace_name = active_workspace_name or current_filters.get("workspace_name")
        self.clear_workspace_flag = False
        
        self.attributes("-topmost", True)
        self.lift()
        self.focus_force()
        
        ctk.CTkLabel(self, text="Filter Settings", font=("Segoe UI", 20, "bold")).pack(pady=15)
        
        scroll_frame = ctk.CTkScrollableFrame(self)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # --- Section 1: Tags ---
        ctk.CTkLabel(scroll_frame, text="Tags", font=("Segoe UI", 14, "bold"), text_color="gray").pack(anchor="w", pady=(5,0))
        
        ctk.CTkLabel(scroll_frame, text="Include (comma separated)").pack(anchor="w")
        self.tags_include = ctk.CTkEntry(scroll_frame)
        self.tags_include.pack(fill="x", pady=5)
        if "tags_include" in current_filters:
            self.tags_include.insert(0, current_filters["tags_include"])
            
        ctk.CTkLabel(scroll_frame, text="Exclude").pack(anchor="w")
        self.tags_exclude = ctk.CTkEntry(scroll_frame)
        self.tags_exclude.pack(fill="x", pady=5)
        if "tags_exclude" in current_filters:
            self.tags_exclude.insert(0, current_filters["tags_exclude"])

        # --- Section 2: Active Workspace ---
        if self.active_workspace_name:
            ctk.CTkLabel(scroll_frame, text="Workspace", font=("Segoe UI", 14, "bold"), text_color="gray").pack(anchor="w", pady=(15,5))
            
            ws_frame = ctk.CTkFrame(scroll_frame, fg_color="transparent")
            ws_frame.pack(fill="x")
            
            self.ws_label = ctk.CTkLabel(ws_frame, text=f"📂 {self.active_workspace_name}", font=("Segoe UI", 12), text_color="#a8a29e")
            self.ws_label.pack(side="left")
            
            ctk.CTkButton(ws_frame, text="Clear", width=60, height=24, fg_color="#ef4444", hover_color="#991b1b",
                          command=self._clear_workspace).pack(side="right")

        # --- Section 3: Status (Checkboxes) ---
        ctk.CTkLabel(scroll_frame, text="Status", font=("Segoe UI", 14, "bold"), text_color="gray").pack(anchor="w", pady=(15,0))
        
        status_frame = ctk.CTkFrame(scroll_frame, fg_color="transparent")
        status_frame.pack(fill="x", pady=5)
        status_frame.grid_columnconfigure(0, weight=1)
        status_frame.grid_columnconfigure(1, weight=1)
        
        self.vars = {}
        
        def add_cb(key, text, default, row, col):
            var = ctk.BooleanVar(value=current_filters.get(key, default))
            self.vars[key] = var
            ctk.CTkCheckBox(status_frame, text=text, variable=var).grid(row=row, column=col, sticky="w", pady=5, padx=5)

        add_cb("liked", "Liked Only", False, 0, 0)
        add_cb("hide_disliked", "Hide Disliked", True, 0, 1)
        add_cb("hide_gen_stems", "Hide Stems", True, 1, 0)
        add_cb("stems_only", "Stems Only", False, 1, 1)
        add_cb("hide_studio_clips", "Hide Clips", True, 2, 0)
        add_cb("is_public", "Public", False, 2, 1)
        add_cb("trashed", "Trash", False, 3, 0)

        # --- Section 4: Type (Radio) ---
        ctk.CTkLabel(scroll_frame, text="Type", font=("Segoe UI", 14, "bold"), text_color="gray").pack(anchor="w", pady=(15,0))
        
        self.type_var = ctk.StringVar(value=current_filters.get("type", "all"))
        
        type_frame = ctk.CTkFrame(scroll_frame, fg_color="transparent")
        type_frame.pack(fill="x", pady=5)
        
        ctk.CTkRadioButton(type_frame, text="All", variable=self.type_var, value="all").pack(anchor="w", pady=2)
        ctk.CTkRadioButton(type_frame, text="Generations", variable=self.type_var, value="generations").pack(anchor="w", pady=2)
        ctk.CTkRadioButton(type_frame, text="Uploads", variable=self.type_var, value="uploads").pack(anchor="w", pady=2)

        # Apply Button
        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkButton(btn_frame, text="Apply Filters", command=self.apply, height=40).pack(fill="x")
        
    def _clear_workspace(self):
        self.clear_workspace_flag = True
        self.ws_label.configure(text="✓ Cleared", text_color="#10b981")

    def apply(self):
        filters = {
            "tags_include": self.tags_include.get(),
            "tags_exclude": self.tags_exclude.get(),
            "type": self.type_var.get()
        }
        
        # Add boolean vars
        for key, var in self.vars.items():
            filters[key] = var.get()
            
        if self.clear_workspace_flag:
            filters["clear_workspace"] = True
            
        self.on_apply(filters)
        self.destroy()


class WorkspaceBrowser(ctk.CTkToplevel):
    def __init__(self, parent, workspaces, on_select, bg_color="#1a1a1a", fg_color="#ffffff", accent_color="#8b5cf6", title="Select Workspace"):
        super().__init__(parent)
        self.title(title)
        self.geometry("400x500")
        self.attributes("-topmost", True)
        self.lift()
        self.focus_force()
        self.on_select = on_select
        
        ctk.CTkLabel(self, text=title, font=("Segoe UI", 16, "bold")).pack(pady=10)
        
        scroll_frame = ctk.CTkScrollableFrame(self)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        for ws in workspaces:
            self._create_item(scroll_frame, ws)
            
    def _create_item(self, parent, ws):
        name = ws.get("name", "Untitled")
        name = ws.get("name", "Untitled")
        # Check various keys for count
        count = ws.get('clip_count') or ws.get('num_tracks') or ws.get('total_clips') or ws.get('num_total_results') or ws.get('size') or 0
        date = ws.get('updated_at', '')[:10]
        
        card = ctk.CTkButton(parent, text=f"{name}\n{count} Songs • {date}", 
                             font=("Segoe UI", 12),
                             fg_color="transparent", border_width=1, border_color="#333",
                             hover_color="#333", anchor="w",
                             command=lambda: self._select(ws))
        card.pack(fill="x", pady=2)
        
    def _select(self, ws):
        self.on_select(ws)
        self.destroy()


class NeonProgressBar(ctk.CTkProgressBar):
    # Simple wrapper to match interface, or we just use normal progressbar
    def __init__(self, parent, height=10, colors=None, **kwargs):
        super().__init__(parent, height=height, **kwargs)
        self.configure(progress_color="#8b5cf6") # Purple
        
    def start(self, interval=20):
        self.configure(mode="indeterminate")
        self.start()
        
    def stop(self):
        self.stop()
        self.configure(mode="determinate")
        self.set(0)
        
    def set_text(self, text):
        pass # Not supported on native, maybe add label overlay later


class EmptyStateWidget(ctk.CTkFrame):
    def __init__(self, parent, theme, **kwargs):
        super().__init__(parent, fg_color="transparent", **kwargs)
        
        container = ctk.CTkFrame(self, fg_color="transparent")
        container.place(relx=0.5, rely=0.5, anchor="center")
        
        ctk.CTkLabel(container, text="♪", font=("Segoe UI", 64), text_color="gray").pack(pady=(0, 16))
        ctk.CTkLabel(container, text="Ready to Sync", font=("Segoe UI", 14, "bold"), text_color="gray").pack()
        ctk.CTkLabel(container, text="Click 'Preload List' or 'Start Download' to begin", font=("Segoe UI", 10), text_color="gray").pack(pady=(8, 0))


class LibraryRow(ctk.CTkFrame):
    def __init__(self, parent, data, on_play=None, on_menu=None, odd_row=False, on_click=None, **kwargs):
        # Background color for striping
        bg_color = "#18181b" if not odd_row else "#27272a" 
        super().__init__(parent, fg_color=bg_color, corner_radius=0, height=35, **kwargs)
        self.data = data
        self.on_play = on_play
        self.on_menu = on_menu
        self.on_click_callback = on_click
        self.default_bg = bg_color
        self.selected_bg = "#2563eb" # Blue
        self.is_selected = False
        self.hover_bg = "#3f3f46"


        # Configure grid columns to match header exactly
        self.grid_columnconfigure(0, weight=3, minsize=200) # Title
        self.grid_columnconfigure(1, weight=2, minsize=150) # Artist
        self.grid_columnconfigure(2, weight=2, minsize=150) # Genre
        self.grid_columnconfigure(3, weight=1, minsize=80)  # BPM
        self.grid_columnconfigure(4, weight=1, minsize=80)  # Duration
        
        # Import tooltip
        from tooltip import ToolTip
        
        # 0. Artwork
        self.image_path = data.get("image_path")
        self.thumb_lbl = None
        if self.image_path and os.path.exists(self.image_path):
            try:
                from PIL import Image
                img = Image.open(self.image_path)
                # Resize to small square
                img = img.resize((30, 30), Image.Resampling.LANCZOS)
                ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=(30, 30))
                self.thumb_lbl = ctk.CTkLabel(self, text="", image=ctk_img)
                self.thumb_lbl.grid(row=0, column=0, sticky="w", padx=(5, 5), pady=5)
            except:
                pass

        # 1. Title - Left aligned with truncation (Shifted right due to image)
        title = data.get("title", "Unknown")
        title_truncated = False
        # Reduced from 35 to 25 to accommodate image
        if len(title) > 25:
            title_display = title[:22] + "..."
            title_truncated = True
        else:
            title_display = title
        self.title_lbl = ctk.CTkLabel(self, text=title_display, anchor="w", font=("Segoe UI", 11))
        # Use column 0 but add padding if image exists, or use a frame?
        # A Better way is to put image and title in same column 0 or split column 0.
        # But for simplicity, let's just push title to the right within column 0 using padding.
        
        # ACTUALLY: Let's refactor columns slightly to be cleaner.
        # Current: 0=Title, 1=Artist, 2=Genre, 3=BPM, 4=Duration
        # New: 0=Image(fixed 40), 1=Title, 2=Artist...
        
        # But Library header uses fixed columns. We shouldn't change grid structure too much or header breaks.
        # Let's put Image AND Title in Column 0 using a sub-frame or just pack them?
        # Grid is easier. Let's put Image at x=5, Title at x=40
        
        # Wait, I cannot easily nest grid inside grid cell without a frame.
        # Let's use a frame for Column 0
        self.title_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.title_frame.grid(row=0, column=0, sticky="ew", padx=(5, 5))
        
        if self.thumb_lbl:
            self.thumb_lbl.destroy() # Re-create inside frame
            try:
                 # Re-load image (can't reuse ctk_image object easily if we didn't save it, but we have code above)
                 # Let's just do it all inside here.
                 from PIL import Image
                 img = Image.open(self.image_path)
                 img = img.resize((30, 30), Image.Resampling.LANCZOS)
                 ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=(30, 30))
                 self.thumb_lbl = ctk.CTkLabel(self.title_frame, text="", image=ctk_img, width=30)
                 self.thumb_lbl.pack(side="left", padx=(0, 5))
            except: pass

        self.title_lbl = ctk.CTkLabel(self.title_frame, text=title_display, anchor="w", font=("Segoe UI", 11))
        self.title_lbl.pack(side="left", fill="x", expand=True)

        if title_truncated:
            ToolTip(self.title_lbl, title)
        
        # 2. Artist - Left aligned with truncation
        artist = data.get("artist", "Unknown")
        artist_truncated = False
        # Reduced from 30 to 25
        if len(artist) > 25:
            artist_display = artist[:22] + "..."
            artist_truncated = True
        else:
            artist_display = artist
        self.artist_lbl = ctk.CTkLabel(self, text=artist_display, anchor="w", font=("Segoe UI", 11), text_color="#a1a1aa")
        self.artist_lbl.grid(row=0, column=1, sticky="ew", padx=5, pady=5)
        if artist_truncated:
            ToolTip(self.artist_lbl, artist)
        
        # 3. Genre - Left aligned with truncation
        genre = data.get("genre", "--")
        genre_str = str(genre)
        genre_truncated = False
        if len(genre_str) > 20:
            genre_display = genre_str[:17] + "..."
            genre_truncated = True
        else:
            genre_display = genre_str
        self.genre_lbl = ctk.CTkLabel(self, text=genre_display, anchor="w", font=("Segoe UI", 11), text_color="#a1a1aa")
        self.genre_lbl.grid(row=0, column=2, sticky="ew", padx=5, pady=5)
        if genre_truncated:
            ToolTip(self.genre_lbl, genre_str)
        
        # 4. BPM - Center aligned
        bpm = data.get("bpm", "--")
        self.bpm_lbl = ctk.CTkLabel(self, text=str(bpm), anchor="center", font=("Segoe UI", 11), text_color="#a1a1aa")
        self.bpm_lbl.grid(row=0, column=3, sticky="ew", padx=5, pady=5)

        # 5. Duration - Right aligned
        dur_sec = data.get("duration", 0)
        mins, secs = divmod(dur_sec, 60)
        dur_str = f"{int(mins)}:{int(secs):02d}"
        self.dur_lbl = ctk.CTkLabel(self, text=dur_str, anchor="e", font=("Segoe UI", 11), text_color="#a1a1aa")
        self.dur_lbl.grid(row=0, column=4, sticky="ew", padx=(5, 10), pady=5)
        
        # Events
        self.bind("<Enter>", self.on_enter)
        self.bind("<Leave>", self.on_leave)
        self.bind("<Button-1>", self.on_click)
        self.bind("<Double-Button-1>", self.on_double_click)
        self.bind("<Button-3>", self.on_right_click)
        
        # Bind children to same events
        for child in self.winfo_children():
            child.bind("<Enter>", self.on_enter)
            child.bind("<Leave>", self.on_leave)
            child.bind("<Button-1>", self.on_click)
            child.bind("<Double-Button-1>", self.on_double_click)
            child.bind("<Button-3>", self.on_right_click)

    def set_selected(self, selected):
        self.is_selected = selected
        if self.winfo_exists():
            self.configure(fg_color=self.selected_bg if selected else self.default_bg)

    def on_enter(self, event):
        if not self.winfo_exists(): return
        if not self.is_selected:
            self.configure(fg_color=self.hover_bg)

    def on_leave(self, event):
        if not self.winfo_exists(): return
        if not self.is_selected:
            self.configure(fg_color=self.default_bg)

    def on_click(self, event):
        if not self.winfo_exists(): return
        if self.on_click_callback:
            self.on_click_callback(event, self.data, self)
            
    def on_double_click(self, event):
        if not self.winfo_exists(): return
        if self.on_play:
            self.on_play(self.data)

    def on_right_click(self, event):
        if not self.winfo_exists(): return
        if self.on_menu:
            self.on_menu(event, self.data)
