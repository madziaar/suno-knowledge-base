from PIL import ImageFont

class ThemeManager:
    def __init__(self):
        # Modern Dark Mode Palette
        # Modern Dark Mode Palette - Premium Redesign
        self.bg_dark = "#121212"      # Main background (Gunmetal)
        self.bg_sidebar = "#0a0a0a"   # Sidebar background (Darker)
        self.card_bg = "#1E1E1E"      # Card/Panel background
        self.bg_card = self.card_bg   # Alias
        self.bg_input = "#272727"     # Input fields
        
        self.fg_primary = "#E0E0E0"   # Main text (Off-white)
        self.fg_secondary = "#A0A0A0" # Secondary text (Light grey)
        
        self.accent_purple = "#8B5CF6" # Primary Action (Vibrant Violet)
        self.accent_purple_hover = "#7c3aed" # Hover state
        self.accent_pink = "#EC4899"   # Secondary Accent
        self.accent_red = "#EF4444"    # Destructive Action
        
        self.border_subtle = "#333333" # Subtle borders
        self.card_border = "#333333"   # Card borders
        
        self.section_font = ("Segoe UI", 11, "bold")
        self.title_font = ("Segoe UI", 24, "bold")
        self.mono_font = ("Consolas", 10)
        self.nav_font = ("Segoe UI", 11, "bold")

    def load_title_font(self, size):
        # Fallback to Segoe UI for title as well, keeping it clean
        return ImageFont.truetype("arial.ttf", size) 

    def apply_treeview_style(self):
        import tkinter.ttk as ttk
        style = ttk.Style()
        
        # 'clam' theme supports background color customization better than default Windows theme
        try:
            style.theme_use("clam")
        except:
            pass
        
        # Configure Treeview colors
        # Use existing theme colors
        style.configure("Treeview", 
                        background=self.bg_card, 
                        foreground="white", 
                        fieldbackground=self.bg_card,
                        borderwidth=0,
                        font=self.section_font)
                        
        # Map selection color to Purple
        style.map("Treeview", 
                  background=[("selected", self.accent_purple)], 
                  foreground=[("selected", "white")])
                  
        # Heading
        style.configure("Treeview.Heading", 
                        background=self.bg_card, 
                        foreground="gray", 
                        relief="flat",
                        font=self.nav_font)
        style.map("Treeview.Heading",
                  background=[("active", self.bg_input)]) 

