import customtkinter as ctk

class Sidebar(ctk.CTkFrame):
    """Left sidebar navigation."""
    def __init__(self, parent, on_navigate, **kwargs):
        super().__init__(parent, width=220, corner_radius=0, **kwargs)
        # self.pack_propagate(False) # Fixed width handled by grid usually, unlikely needed if placed correctly
        
        self.on_navigate = on_navigate
        self.buttons = {}
        
        self._create_widgets()

    def _create_widgets(self):
        # Logo Area
        logo_label = ctk.CTkLabel(self, text="SunoSync", font=("Segoe UI", 24, "bold"))
        logo_label.pack(pady=(30, 20), padx=20, anchor="w")
        
        # Navigation Items
        self._add_nav_item("Dashboard", "🏠", "dashboard")
        self._add_nav_item("Downloader", "⬇", "downloader")
        self._add_nav_item("Library", "🎵", "library")
        self._add_nav_item("Prompt Vault", "📓", "vault")
        self._add_nav_item("Mobile Sync", "📱", "mobile_sync")
        self._add_nav_item("Suno On-Air", "📡", "radio")
        
        # Spacer
        ctk.CTkFrame(self, fg_color="transparent").pack(fill="both", expand=True)
        
        # Settings / Bottom Area
        self._add_nav_item("Settings", "⚙", "settings", bottom=True)



    def set_active(self, view_name):
        """Update active state of buttons."""
        for name, btn in self.buttons.items():
            if name == view_name:
                btn.configure(fg_color=("gray75", "gray25"), text_color=("black", "white"))
            else:
                btn.configure(fg_color="transparent", text_color=("gray10", "gray90"))

    # --- Wrapper for Navigation with Limits ---
    def handle_click(self, view_name):
        # UNLOCKED: All features available in paid EXE
        self.on_navigate(view_name)

    def _add_nav_item(self, text, icon, view_name, bottom=False):
        # Create button
        # Use handle_click instead of direct on_navigate
        btn = ctk.CTkButton(self, 
                            text=f"  {icon}  {text}", 
                            anchor="w",
                            command=lambda: self.handle_click(view_name),
                            fg_color="transparent",
                            text_color=("gray10", "gray90"),
                            hover_color=("gray70", "gray30"),
                            height=45,
                            font=("Segoe UI", 16))
        
        if bottom:
            btn.pack(side="bottom", fill="x", pady=(0, 20), padx=10)
        else:
            btn.pack(fill="x", pady=2, padx=10)
            
        self.buttons[view_name] = btn
