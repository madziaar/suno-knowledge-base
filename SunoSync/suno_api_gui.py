import os
import sys
import time
import threading
import requests
import re
import json
import math
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from mutagen.id3 import ID3, APIC, TIT2, TPE1, TCON, COMM, TDRC, TYER, USLT, TXXX, error
from mutagen.mp3 import MP3
import webbrowser
import pyperclip
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from PIL import Image, ImageTk, ImageDraw, ImageFont
import traceback


def hex_to_rgb(color):
    color = color.lstrip("#")
    if len(color) == 6:
        return tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
    elif len(color) == 8:
        return tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
    return (0, 0, 0)


def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def blend_colors(color_a, color_b, ratio):
    a = hex_to_rgb(color_a)
    b = hex_to_rgb(color_b)
    ratio = max(0.0, min(1.0, ratio))
    return rgb_to_hex(tuple(int(max(0, min(255, a[i] + (b[i] - a[i]) * ratio))) for i in range(3)))


def lighten_color(color, amount=0.1):
    rgb = hex_to_rgb(color)
    return rgb_to_hex(tuple(max(0, min(255, int(c + (255 - c) * amount))) for c in rgb))

# --- CONSTANTS & CONFIG ---
FILENAME_BAD_CHARS = r'[<>:"/\\|?*\x00-\x1F]'

if getattr(sys, 'frozen', False):
    base_path = os.path.dirname(sys.executable)
else:
    base_path = os.path.dirname(os.path.abspath(__file__))

user_data_dir = os.path.join(base_path, "Suno_Browser_Profile")
CONFIG_FILE = os.path.join(base_path, "config.json")

# --- UTILS ---
def sanitize_filename(name, maxlen=200):
    safe = re.sub(FILENAME_BAD_CHARS, "_", name)
    safe = safe.strip(" .")
    return safe[:maxlen] if len(safe) > maxlen else safe

def get_unique_filename(filename):
    if not os.path.exists(filename): return filename
    name, extn = os.path.splitext(filename)
    counter = 2
    while True:
        new_filename = f"{name} v{counter}{extn}"
        if not os.path.exists(new_filename): return new_filename
        counter += 1

def get_downloaded_uuids(directory):
    uuids = set()
    if not os.path.exists(directory): return uuids
    
    for root, dirs, files in os.walk(directory):
        for fname in files:
            if fname.lower().endswith(".mp3"):
                try:
                    audio = ID3(os.path.join(root, fname))
                    for frame in audio.getall("TXXX"):
                        if frame.desc == "SUNO_UUID":
                            uuids.add(frame.text[0])
                except:
                    pass
    return uuids

def embed_metadata(mp3_path, image_url=None, title=None, artist=None, album=None, genre=None, year=None, comment=None, lyrics=None, uuid=None, token=None, timeout=15):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        image_bytes = None
        if image_url:
            r = requests.get(image_url, headers=headers, timeout=timeout)
            if r.status_code == 200:
                image_bytes = r.content
                mime = r.headers.get("Content-Type", "image/jpeg").split(";")[0]
        
        audio = MP3(mp3_path, ID3=ID3)
        try: audio.add_tags()
        except error: pass

        if title: audio.tags["TIT2"] = TIT2(encoding=3, text=title)
        if artist: audio.tags["TPE1"] = TPE1(encoding=3, text=artist)
        if genre: audio.tags["TCON"] = TCON(encoding=3, text=genre)
        if year:
            audio.tags["TDRC"] = TDRC(encoding=3, text=str(year))
            audio.tags["TYER"] = TYER(encoding=3, text=str(year))
        if comment: audio.tags["COMM"] = COMM(encoding=3, lang='eng', desc='Description', text=comment)
        if lyrics: audio.tags["USLT"] = USLT(encoding=3, lang='eng', desc='Lyrics', text=lyrics)
        if uuid: audio.tags.add(TXXX(encoding=3, desc='SUNO_UUID', text=uuid))

        if image_bytes:
            for key in list(audio.tags.keys()):
                if key.startswith("APIC"): del audio.tags[key]
            audio.tags.add(APIC(encoding=3, mime=mime, type=3, desc="Cover", data=image_bytes))
            
        audio.save(v2_version=3)
    except Exception as e:
        print(f"Metadata error: {e}")

# --- CUSTOM WIDGETS ---
class RoundedButton(tk.Canvas):
    def __init__(self, parent, text, command, bg_color, fg_color, hover_color=None, 
                 font=("Segoe UI", 10), width=200, height=40, border_color=None,
                 gradient_colors=None, glow_color=None, **kwargs):
        super().__init__(parent, width=width, height=height, bg=parent.cget('bg'),
                        highlightthickness=0, borderwidth=0, **kwargs)
        
        self.command = command
        self.bg_color = bg_color
        self.fg_color = fg_color
        self.hover_color = hover_color or bg_color
        self.border_color = border_color
        self.gradient_colors = gradient_colors
        self.glow_color = glow_color
        self.text = text
        self.font = font
        self.width = width
        self.height = height
        self.current_width = width
        self.current_height = height
        self.is_hovered = False
        self.is_pressed = False
        self.scale_factor = 1.0
        self.is_active = False
        self._pulse_phase = 0
        self._gradient_photo = None
        self._active_job = None
        self.is_disabled = False
        
        self.draw()

        self.bind("<Configure>", self.on_configure)
        
        self.bind("<Button-1>", self.on_click)
        self.bind("<ButtonRelease-1>", self.on_release)
        self.bind("<Enter>", self.on_enter)
        self.bind("<Leave>", self.on_leave)
    
    def draw(self):
        self.delete("all")
        w, h = self.current_width, self.current_height
        if w <= 0 or h <= 0:
            return

        r = 8
        scale = self.scale_factor
        draw_w = max(1, int(w * scale))
        draw_h = max(1, int(h * scale))
        offset_x = (w - draw_w) // 2
        offset_y = (h - draw_h) // 2

        current_bg = self.bg_color
        if self.is_pressed:
            current_bg = self._darken_color(current_bg, 0.85)
        elif self.is_hovered:
            current_bg = self.hover_color

        if self.gradient_colors:
            start, end = self.gradient_colors
            if self.is_hovered:
                start = lighten_color(start, 0.08)
                end = lighten_color(end, 0.08)
            if self.is_active:
                pulse = (math.sin(self._pulse_phase / 5) + 1) / 2 * 0.3
                start = blend_colors(start, lighten_color(start, pulse), 0.5)
                end = blend_colors(end, lighten_color(end, pulse), 0.5)
            gradient_img = self._make_gradient_image(draw_w, draw_h, start, end, r)
            self._gradient_photo = ImageTk.PhotoImage(gradient_img)
            self.create_image(offset_x, offset_y, anchor="nw", image=self._gradient_photo)
        else:
            self._draw_round_rect(offset_x, offset_y, draw_w, draw_h, r,
                                   fill=current_bg, outline=None, width_line=0)

        if self.border_color:
            self._draw_round_rect(offset_x, offset_y, draw_w, draw_h, r,
                                   outline=self.border_color, width_line=2)

        if self.glow_color and self.gradient_colors:
            self._draw_round_rect(offset_x - 6, offset_y - 6, draw_w + 12, draw_h + 12,
                                   r + 6, outline=self.glow_color, width_line=3)

        self.create_text(w / 2, h / 2, text=self.text, fill=self.fg_color, font=self.font)
    
    def _draw_round_rect_shape(self, x, y, width, height, radius, fill, outline, line_width):
        self.create_arc(x, y, x + radius*2, y + radius*2, start=90, extent=90,
                        fill=fill, outline=outline, width=line_width)
        self.create_arc(x + width - radius*2, y, x + width, y + radius*2, start=0, extent=90,
                        fill=fill, outline=outline, width=line_width)
        self.create_arc(x, y + height - radius*2, x + radius*2, y + height, start=180, extent=90,
                        fill=fill, outline=outline, width=line_width)
        self.create_arc(x + width - radius*2, y + height - radius*2, x + width, y + height, start=270, extent=90,
                        fill=fill, outline=outline, width=line_width)
        self.create_rectangle(x + radius, y, x + width - radius, y + height, fill=fill, outline=outline, width=line_width)
        self.create_rectangle(x, y + radius, x + width, y + height - radius, fill=fill, outline=outline, width=line_width)

    def _draw_round_rect(self, x, y, width, height, radius, fill=None, outline=None, width_line=1):
        if fill:
            self._draw_round_rect_shape(x, y, width, height, radius, fill, fill, 0)
        if outline and width_line > 0:
            self._draw_round_rect_shape(x, y, width, height, radius, "", outline, width_line)

    def _make_gradient_image(self, w, h, start, end, radius):
        if w <= 0 or h <= 0:
            return Image.new("RGBA", (1, 1))
        base = Image.new("RGBA", (w, h))
        draw = ImageDraw.Draw(base)
        total = max(1, h - 1)
        for y in range(h):
            ratio = ((y + self._pulse_phase) % max(1, h)) / total
            color = blend_colors(start, end, ratio)
            draw.line([(0, y), (w, y)], fill=color)
        mask = Image.new("L", (w, h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
        base.putalpha(mask)
        return base

    def _darken_color(self, color, factor):
        # Simple color darkening
        if color.startswith('#'):
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            r = int(r * factor)
            g = int(g * factor)
            b = int(b * factor)
            return f"#{r:02x}{g:02x}{b:02x}"
        return color
    
    def on_click(self, event):
        if self.is_disabled:
            return
        self.is_pressed = True
        self.scale_factor = 0.98
        self.draw()
        if self.command:
            self.command()
    
    def on_release(self, event):
        if self.is_disabled:
            return
        self.is_pressed = False
        self.scale_factor = 1.02 if self.is_hovered else 1.0
        self.draw()
    
    def on_enter(self, event):
        if self.is_disabled:
            return
        self.is_hovered = True
        self.scale_factor = 1.02
        self.config(cursor="hand2")
        self.draw()
    
    def on_leave(self, event):
        if self.is_disabled:
            return
        self.is_hovered = False
        self.scale_factor = 1.0
        self.config(cursor="")
        self.draw()
    
    def config_state(self, state):
        if state == "disabled":
            self.is_disabled = True
            self.unbind("<Button-1>")
            self.unbind("<Enter>")
            self.unbind("<Leave>")
            self.scale_factor = 1.0
        else:
            self.is_disabled = False
            self.bind("<Button-1>", self.on_click)
            self.bind("<Enter>", self.on_enter)
            self.bind("<Leave>", self.on_leave)

    def on_configure(self, event):
        self.current_width = event.width
        self.current_height = event.height
        self.draw()

    def set_active(self, active):
        if self.is_active == active:
            return
        self.is_active = active
        if active:
            self._pulse_phase = 0
            self._start_pulse()
        else:
            if self._active_job:
                self.after_cancel(self._active_job)
                self._active_job = None
            self.draw()

    def _start_pulse(self):
        if not self.is_active:
            return
        self._pulse_phase = (self._pulse_phase + 1) % 40
        self.draw()
        self._active_job = self.after(120, self._start_pulse)


class RoundedCardFrame(tk.Frame):
    def __init__(self, parent, bg_color, corner_radius=12, padding=6, **kwargs):
        super().__init__(parent, bg=parent.cget("bg"), **kwargs)
        self.bg_color = bg_color
        self.corner_radius = corner_radius
        self.padding = padding
        self.canvas = tk.Canvas(self, bg=parent.cget("bg"), highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)
        self.inner = tk.Frame(self.canvas, bg=bg_color)
        self.inner_window = self.canvas.create_window((padding, padding), window=self.inner, anchor="nw")
        self.canvas.bind("<Configure>", self._redraw)

    def _draw_round_rect(self, x, y, width, height, radius, fill=None):
        if width <= 0 or height <= 0:
            return
        self.canvas.create_arc(x, y, x + radius * 2, y + radius * 2, start=90, extent=90,
                               fill=fill, outline=fill, width=0, tags="card")
        self.canvas.create_arc(x + width - radius * 2, y, x + width, y + radius * 2, start=0, extent=90,
                               fill=fill, outline=fill, width=0, tags="card")
        self.canvas.create_arc(x, y + height - radius * 2, x + radius * 2, y + height, start=180, extent=90,
                               fill=fill, outline=fill, width=0, tags="card")
        self.canvas.create_arc(x + width - radius * 2, y + height - radius * 2, x + width, y + height, start=270,
                               extent=90, fill=fill, outline=fill, width=0, tags="card")
        self.canvas.create_rectangle(x + radius, y, x + width - radius, y + height, fill=fill, outline=fill,
                                     tags="card")
        self.canvas.create_rectangle(x, y + radius, x + width, y + height - radius, fill=fill, outline=fill,
                                     tags="card")

    def _redraw(self, event):
        self.canvas.delete("card")
        width = max(event.width, 0)
        height = max(event.height, 0)
        self._draw_round_rect(0, 0, width, height, self.corner_radius, fill=self.bg_color)
        inner_w = max(width - 2 * self.padding, 0)
        inner_h = max(height - 2 * self.padding, 0)
        self.canvas.coords(self.inner_window, self.padding, self.padding)
        self.canvas.itemconfig(self.inner_window, width=inner_w, height=inner_h)


class CollapsibleCard(RoundedCardFrame):
    def __init__(self, parent, title, bg_color, corner_radius=12, padding=6, collapsed=True, **kwargs):
        super().__init__(parent, bg_color=bg_color, corner_radius=corner_radius, padding=padding, **kwargs)
        self.title = title
        self.collapsed = collapsed
        header = tk.Frame(self.inner, bg=bg_color)
        header.pack(fill="x", pady=(0, 4))
        accent = tk.Frame(header, width=4, bg="#ff00ff")
        accent.pack(side="left", fill="y", padx=(0, 0))
        content = tk.Frame(header, bg=bg_color)
        content.pack(side="left", fill="x", expand=True)
        self.arrow_label = tk.Label(content, text="▶", font=("Segoe UI", 12, "bold"), bg=bg_color, fg="#f8fafc")
        self.arrow_label.pack(side="left")
        self.title_label = tk.Label(content, text=title, font=("Segoe UI", 11, "bold"),
                                    bg=bg_color, fg="#f8fafc")
        self.title_label.pack(side="left", padx=(8, 0))
        for widget in (header, content, self.arrow_label, self.title_label):
            widget.bind("<Button-1>", self.toggle)
            widget.bind("<Enter>", self._on_header_enter)
            widget.bind("<Leave>", self._on_header_leave)
        self._header_bg = bg_color
        self._hover_bg = lighten_color(bg_color, 0.05)
        self.body = tk.Frame(self.inner, bg=bg_color)
        self.body.pack(fill="both", expand=True)
        if collapsed:
            self.body.pack_forget()
        self._update_arrow()
        self.header = header
        self.accent_strip = accent
        self._adjust_size()

    def _on_header_enter(self, event=None):
        self.header.configure(bg=self._hover_bg)
        for child in self.header.winfo_children():
            if child is self.accent_strip:
                continue
            child.configure(bg=self._hover_bg)

    def _on_header_leave(self, event=None):
        self.header.configure(bg=self._header_bg)
        for child in self.header.winfo_children():
            if child is self.accent_strip:
                continue
            child.configure(bg=self._header_bg)

    def set_collapsed(self, collapsed):
        if self.collapsed == collapsed:
            return
        self.collapsed = collapsed
        if self.collapsed:
            self.body.pack_forget()
        else:
            self.body.pack(fill="both", expand=True)
        self._update_arrow()
        self._adjust_size()

    def toggle(self, event=None):
        self.collapsed = not self.collapsed
        if self.collapsed:
            self.body.pack_forget()
        else:
            self.body.pack(fill="both", expand=True)
        self._update_arrow()
        self._adjust_size()

    def _update_arrow(self):
        self.arrow_label.config(text="▼" if not self.collapsed else "▶")

    def _adjust_size(self):
        self.inner.update_idletasks()
        header_height = self.header.winfo_reqheight()
        body_height = self.body.winfo_reqheight() if not self.collapsed else 0
        total_height = header_height + body_height + self.padding * 2
        event = type("E", (), {"width": self.canvas.winfo_width(), "height": max(total_height, 1)})
        self.canvas.config(height=event.height)
        self._redraw(event)

class ToggleSwitch(tk.Canvas):
    def __init__(self, parent, variable, **kwargs):
        super().__init__(parent, width=50, height=24, bg='#0a0a0a', highlightthickness=0, **kwargs)
        self.variable = variable
        self.is_on = variable.get()
        
        self.off_color = "#2a2a2a"
        self.on_color = "#8b5cf6"
        
        self.draw()
        self.bind("<Button-1>", self.toggle)
        self.variable.trace_add("write", lambda *args: self.update_from_var())
    
    def draw(self):
        self.delete("all")
        bg_color = self.on_color if self.is_on else self.off_color
        
        self.create_oval(2, 2, 22, 22, fill=bg_color, outline="")
        self.create_rectangle(12, 2, 38, 22, fill=bg_color, outline="")
        self.create_oval(28, 2, 48, 22, fill=bg_color, outline="")
        
        x = 28 if self.is_on else 6
        self.create_oval(x, 4, x+16, 20, fill="#ffffff", outline="")
    
    def toggle(self, event=None):
        self.is_on = not self.is_on
        self.variable.set(self.is_on)
        self.draw()
    
    def update_from_var(self):
        new_val = self.variable.get()
        if new_val != self.is_on:
            self.is_on = new_val
            self.draw()


class ActivityLogPane(tk.Frame):
    _scroll_style_created = False

    def __init__(self, parent, bg_color, alt_color, text_color, *args, **kwargs):
        super().__init__(parent, bg=bg_color, *args, **kwargs)
        if not ActivityLogPane._scroll_style_created:
            style = ttk.Style()
            try:
                style.theme_use("clam")
            except:
                pass
            style.configure("Log.Vertical.TScrollbar",
                            background="#1f1f1f", troughcolor=bg_color, bordercolor=bg_color,
                            arrowcolor="#f8fafc", gripcount=0, relief="flat")
            ActivityLogPane._scroll_style_created = True

        self.canvas = tk.Canvas(self, bg=bg_color, highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self, command=self.canvas.yview, orient="vertical",
                                       style="Log.Vertical.TScrollbar")
        self.inner_frame = tk.Frame(self.canvas, bg=bg_color)
        self.canvas.create_window((0, 0), window=self.inner_frame, anchor="nw")
        self.canvas.config(yscrollcommand=self.scrollbar.set)
        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")
        self.inner_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.bg_color = bg_color
        self.alt_color = alt_color
        self.text_color = text_color
        self.entries = []
        self._thumb_refs = []
        self.text_labels = []
        self.text_font_size = 12

    def add_entry(self, message, status=None, thumbnail_data=None):
        bg = self.bg_color if len(self.entries) % 2 == 0 else self.alt_color
        row = tk.Frame(self.inner_frame, bg=bg, padx=10, pady=6)
        row.pack(fill="x", expand=True)

        icon_text = "♫"
        icon_color = "#a7f3d0"
        if status == "success":
            icon_text = "✔︎"
            icon_color = "#1ecb4d"
        elif status == "downloading":
            icon_text = "⬇️"
            icon_color = "#7dd3fc"
        elif status == "info":
            icon_text = "ℹ️"
            icon_color = "#facc15"
        elif status == "error":
            icon_text = "⚠️"
            icon_color = "#ef4444"

        icon_label = tk.Label(row, text=icon_text, bg=bg, fg=icon_color, font=("Segoe UI", 12))
        icon_label.pack(side="left")

        if thumbnail_data:
            thumb = self._create_thumbnail(thumbnail_data)
            if thumb:
                thumb_label = tk.Label(row, image=thumb, bg=bg)
                thumb_label.image = thumb
                thumb_label.pack(side="left", padx=(8, 12))

        text_label = tk.Label(row, text=message, bg=bg, fg=self.text_color,
                              font=("Consolas", self.text_font_size, "bold"), anchor="w", justify="left", wraplength=640)
        text_label.pack(side="left", fill="x", expand=True)

        self.text_labels.append(text_label)

        self.entries.append(row)
        self.canvas.update_idletasks()
        self.canvas.yview_moveto(1.0)

    def set_text_font_size(self, size):
        try:
            size = int(size)
        except (ValueError, TypeError):
            size = 12
        self.text_font_size = size
        for label in self.text_labels:
            label.config(font=("Consolas", size, "bold"))

    def _create_thumbnail(self, raw_data):
        try:
            image = Image.open(BytesIO(raw_data))
            image = image.resize((40, 40), Image.Resampling.LANCZOS)
            photo = ImageTk.PhotoImage(image)
            self._thumb_refs.append(photo)
            return photo
        except:
            return None


class NeonProgressBar(tk.Canvas):
    def __init__(self, parent, height=14, colors=("#8A2BE2", "#EC4899"), bg="#101010", **kwargs):
        super().__init__(parent, height=height, bg=bg, highlightthickness=0, **kwargs)
        self.height = height
        self.colors = colors
        self.offset = 0
        self.running = False
        self._job = None
        self.bind("<Configure>", lambda e: self._draw())

    def start(self, interval=20):
        if self.running:
            return
        self.running = True
        self._animate(interval)

    def stop(self):
        self.running = False
        if self._job:
            self.after_cancel(self._job)
            self._job = None
        self.offset = 0
        self._draw()

    def _animate(self, interval):
        if not self.running:
            return
        width = max(1, self.winfo_width())
        self.offset = (self.offset + 4) % width
        self._draw()
        self._job = self.after(interval, lambda: self._animate(interval))

    def _draw(self):
        self.delete("bar")
        width = self.winfo_width()
        if width <= 0:
            return
        for x in range(width):
            ratio = ((x + self.offset) % width) / width
            color = blend_colors(self.colors[0], self.colors[1], ratio)
            self.create_line(x, 0, x, self.height, fill=color, tags="bar")
        self.create_rectangle(0, 0, width, self.height, outline="#e5e7eb", width=1, tags="bar")
# --- GUI APP ---
class SunoApiApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Suno Downloader")
        self.root.geometry("1100x680")
        self.root.minsize(960, 640)
        self.root.resizable(False, False)
        
        self.stop_event = False
        self.executor = None
        
        self.configure_theme()
        self.create_widgets()
        self.load_config()
        self.update_path_display()  # Initial path truncation
    
    def configure_theme(self):
        # Glassmorphism/Cyberpunk palette
        self.bg_dark = "#121212"
        self.card_bg = "#1E1E1E"
        self.bg_card = self.card_bg
        self.card_border = "#f8fafc"
        self.bg_input = "#2d2d2d"
        self.fg_primary = "#e0e0e0"
        self.fg_secondary = "#9ca3af"
        self.accent_purple = "#8b5cf6"
        self.accent_pink = "#ec4899"
        self.accent_blue = "#3b82f6"
        self.border_subtle = "#444444"
        self.section_font = ("Orbitron", 12, "bold")
        self.title_font = ("Orbitron", 46, "bold")
        self.title_image = self._create_title_image("SunoSync")
        
        self.root.configure(bg=self.bg_dark)

    def _load_title_font(self, size):
        candidates = ("Orbitron-Bold.ttf", "Orbitron-Regular.ttf", "arialbd.ttf")
        for name in candidates:
            try:
                return ImageFont.truetype(name, size)
            except:
                continue
        return ImageFont.load_default()

    def _create_title_image(self, text):
        font = self._load_title_font(46)
        try:
            bbox = font.getbbox(text)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except AttributeError:
            text_width, text_height = font.getsize(text)
        padding = 12
        gradient_height = text_height + padding
        gradient = Image.new("RGBA", (text_width, gradient_height))
        draw = ImageDraw.Draw(gradient)
        for y in range(gradient_height):
            ratio = y / max(1, gradient_height - 1)
            color = blend_colors(self.accent_purple, self.accent_pink, ratio)
            draw.line([(0, y), (text_width, y)], fill=color)
        mask = Image.new("L", (text_width, gradient_height), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.text((0, 0), text, font=font, fill=255)
        gradient.putalpha(mask)
        return ImageTk.PhotoImage(gradient)

    def truncate_path(self, path, max_length=40):
        """Truncate path with middle ellipsis"""
        if len(path) <= max_length:
            return path
        # Show first part and last part
        folder_name = os.path.basename(path)
        parent = os.path.dirname(path)
        if len(folder_name) > max_length - 10:
            return f"...{folder_name[-max_length+3:]}"
        return f"{parent[:15]}...{os.sep}{folder_name}"
    
    def update_path_display(self):
        """Update path entry with truncated display"""
        if hasattr(self, 'path_display_var'):
            full_path = self.path_var.get()
            self.path_display_var.set(self.truncate_path(full_path))
    
    def create_tooltip(self, widget, text):
        """Create a tooltip for a widget"""
        def on_enter(event):
            tooltip = tk.Toplevel()
            tooltip.wm_overrideredirect(True)
            tooltip.wm_geometry(f"+{event.x_root+10}+{event.y_root+10}")
            label = tk.Label(tooltip, text=text, bg="#2d2d2d", fg="#e0e0e0",
                           font=("Segoe UI", 9), padx=8, pady=4, relief="solid", borderwidth=1)
            label.pack()
            widget.tooltip = tooltip
        
        def on_leave(event):
            if hasattr(widget, 'tooltip'):
                widget.tooltip.destroy()
                del widget.tooltip
        
        widget.bind("<Enter>", on_enter)
        widget.bind("<Leave>", on_leave)

    def create_widgets(self):
        # Main container with lighter padding
        main_container = tk.Frame(self.root, bg=self.bg_dark)
        main_container.pack(fill="both", expand=True, padx=12, pady=8)

        # Header
        header_frame = tk.Frame(main_container, bg=self.bg_dark)
        header_frame.pack(fill="x", pady=(0, 20))
        
        title_label = tk.Label(header_frame, image=self.title_image, bg=self.bg_dark)
        title_label.pack(side=tk.LEFT)
        title_label.image = self.title_image
        
        # Status badge
        self.status_frame = tk.Frame(header_frame, bg=self.bg_dark)
        self.status_frame.pack(side=tk.RIGHT)
        
        self.status_dot = tk.Canvas(self.status_frame, width=18, height=18, bg=self.bg_dark, highlightthickness=0)
        self.status_dot.pack(side=tk.LEFT, padx=(0, 8))
        self.status_indicator = self.status_dot.create_oval(2, 2, 16, 16, fill="#6b7280", outline="")
        
        self.status_label = tk.Label(self.status_frame, text="Ready", 
                                    font=("Segoe UI", 10, "bold"), bg=self.bg_dark, fg=self.fg_secondary)
        self.status_label.pack(side=tk.LEFT)
        self._status_pulse_job = None
        self._status_pulse_on = False

        # Authorization Card
        self.auth_card = self.create_card(main_container, "Authorization")
        self.auth_card.set_collapsed(False)
        auth_body = self.auth_card.body
        
        tk.Label(auth_body, text="Bearer Token", font=("Segoe UI", 9), 
                bg=self.bg_card, fg=self.fg_secondary).pack(anchor="w", padx=15, pady=(10, 5))
        
        token_container = tk.Frame(auth_body, bg=self.bg_input, highlightbackground=self.border_subtle, highlightthickness=1)
        token_container.pack(fill="x", padx=15, pady=(0, 10))
        
        self.token_var = tk.StringVar()
        self.token_entry = tk.Entry(token_container, textvariable=self.token_var, show="●",
                                   font=("Segoe UI", 10), bg="#2d2d2d", fg=self.fg_primary,
                                   insertbackground=self.fg_primary, relief="flat", bd=0,
                                   highlightthickness=0)
        self.token_entry.pack(side=tk.LEFT, fill="x", expand=True)
        
        # Show/Hide button
        self.show_token_btn = tk.Button(token_container, text="👁", font=("Segoe UI", 10),
                                       bg=self.bg_input, fg=self.fg_secondary, relief="flat",
                                       command=self.toggle_token_visibility, cursor="hand2", bd=0)
        self.show_token_btn.pack(side=tk.LEFT, padx=5)
        
        # Get Token button (full width)
        get_token_btn = RoundedButton(auth_body, "Get Token (Login)", self.get_token_logic,
                                     bg_color=self.bg_input, fg_color=self.accent_purple,
                                     hover_color=self.bg_card, font=("Segoe UI", 10, "bold"),
                                     width=860, height=40)
        get_token_btn.pack(padx=15, pady=(0, 15))

        # Settings Card
        settings_card = self.create_card(main_container, "Settings")
        settings_body = settings_card.body
        
        # Download folder
        tk.Label(settings_body, text="Download Folder", font=("Segoe UI", 9),
                bg=self.bg_card, fg=self.fg_secondary).pack(anchor="w", padx=15, pady=(10, 5))
        
        path_row = tk.Frame(settings_body, bg=self.bg_card)
        path_row.pack(fill="x", padx=15, pady=(0, 15))
        
        self.path_var = tk.StringVar(value=os.path.join(base_path, "Suno_Downloads"))
        self.path_display_var = tk.StringVar()  # For truncated display
        
        path_container = tk.Frame(path_row, bg=self.bg_input, highlightbackground=self.border_subtle, highlightthickness=1)
        path_container.pack(side=tk.LEFT, fill="x", expand=True)
        
        path_entry = tk.Entry(path_container, textvariable=self.path_display_var, state="readonly",
                             font=("Segoe UI", 9), bg="#2d2d2d", fg=self.fg_secondary,
                             relief="flat", bd=0, highlightthickness=0, readonlybackground="#2d2d2d")
        path_entry.pack(fill="x")
        self.create_tooltip(path_entry, "Full path: " + self.path_var.get())
        
        browse_btn = RoundedButton(path_row, "Browse", self.browse_folder,
                                  bg_color=self.accent_purple, fg_color="white",
                                  hover_color="#9d6fff", font=("Segoe UI", 9, "bold"),
                                  width=100, height=36)
        browse_btn.pack(side=tk.LEFT, padx=(8, 4))
        
        open_btn = RoundedButton(path_row, "Open", self.open_folder,
                                bg_color=self.bg_input, fg_color=self.fg_primary,
                                hover_color=self.bg_card, font=("Segoe UI", 9),
                                width=80, height=36)
        open_btn.pack(side=tk.LEFT)
        
        # Options with toggle switches
        opts_container = tk.Frame(settings_body, bg=self.bg_card)
        opts_container.pack(fill="x", padx=15, pady=(0, 15))
        
        self.embed_thumb_var = tk.BooleanVar(value=True)
        embed_row = self.create_toggle_option(opts_container, "Embed Metadata & Art", self.embed_thumb_var)
        self.create_tooltip(embed_row, "Adds title, artist, genre, year, lyrics, and album art to MP3 files")

        self.organize_var = tk.BooleanVar(value=False)
        organize_row = self.create_toggle_option(opts_container, "Organize by Month", self.organize_var)
        self.create_tooltip(organize_row, "Sorts downloads into YYYY-MM subfolders (e.g., 2024-11)")

        self.log_font_size_var = tk.IntVar(value=12)
        font_row = tk.Frame(settings_body, bg=self.bg_card)
        font_row.pack(fill="x", padx=15, pady=(0, 15))
        tk.Label(font_row, text="Activity log font size", font=("Segoe UI", 9),
                bg=self.bg_card, fg=self.fg_secondary).pack(side="left")
        font_spin = tk.Spinbox(font_row, from_=8, to=18, textvariable=self.log_font_size_var,
                               font=("Segoe UI", 9), bg="#2d2d2d", fg=self.fg_primary,
                               insertbackground=self.fg_primary, width=4, relief="flat",
                               bd=0, highlightthickness=0, justify="center",
                               buttonbackground=self.bg_card, command=self.on_log_font_size_change)
        font_spin.pack(side="right")
        self.create_tooltip(font_spin, "Use smaller text to display more entries")
        
        # Batch controls (moved under Settings)
        batch_inner = tk.Frame(settings_body, bg=self.bg_card)
        batch_inner.pack(fill="x", padx=15, pady=(0, 10))
        
        # Start page
        start_col = tk.Frame(batch_inner, bg=self.bg_card)
        start_col.pack(side=tk.LEFT, fill="x", expand=True, padx=(0, 10))
        
        tk.Label(start_col, text="Start from Page", font=("Segoe UI", 9),
                bg=self.bg_card, fg=self.fg_secondary).pack(anchor="w", pady=(0, 5))
        
        start_container = tk.Frame(start_col, bg=self.bg_input, highlightbackground=self.border_subtle, highlightthickness=1)
        start_container.pack(fill="x")
        
        self.start_page_var = tk.IntVar(value=1)
        start_spinbox = tk.Spinbox(start_container, from_=1, to=999, textvariable=self.start_page_var,
                                  font=("Segoe UI", 10), bg=self.bg_input, fg=self.fg_primary,
                                  insertbackground=self.fg_primary, relief="flat", bd=5, width=10,
                                  buttonbackground=self.bg_card, readonlybackground=self.bg_input,
                                  command=self.validate_page_range)
        start_spinbox.pack(fill="x", padx=5, pady=5)
        self.create_tooltip(start_spinbox, "Resume from this page (1 = start from beginning)")
        
        # Max pages
        max_col = tk.Frame(batch_inner, bg=self.bg_card)
        max_col.pack(side=tk.LEFT, fill="x", expand=True)
        
        tk.Label(max_col, text="Max Pages (0 = All)", font=("Segoe UI", 9),
                bg=self.bg_card, fg=self.fg_secondary).pack(anchor="w", pady=(0, 5))
        
        max_container = tk.Frame(max_col, bg=self.bg_input, highlightbackground=self.border_subtle, highlightthickness=1)
        max_container.pack(fill="x")
        
        self.max_pages_var = tk.IntVar(value=0)
        max_spinbox = tk.Spinbox(max_container, from_=0, to=999, textvariable=self.max_pages_var,
                                  font=("Segoe UI", 10), bg=self.bg_input, fg=self.fg_primary,
                                  insertbackground=self.fg_primary, relief="flat", bd=5, width=10,
                                  buttonbackground=self.bg_card, readonlybackground=self.bg_input,
                                  command=self.validate_page_range)
        max_spinbox.pack(fill="x", padx=5, pady=5)
        self.create_tooltip(max_spinbox, "Limit pages to download (0 = download all pages)")
        
        tk.Label(settings_body, text="💡 Tip: ~50 songs per page. Already downloaded songs are automatically skipped.", 
                font=("Segoe UI", 8), bg=self.bg_card, fg=self.fg_secondary).pack(anchor="w", padx=15, pady=(0, 15))

        # Download Section
        download_frame = tk.Frame(main_container, bg=self.bg_dark)
        download_frame.pack(fill="x", pady=15)
        
        button_row = tk.Frame(download_frame, bg=self.bg_dark)
        button_row.pack(fill="x")
        button_row.columnconfigure(0, weight=1)
        button_row.columnconfigure(1, weight=0)

        # Start button with gradient simulation (fills available space)
        self.start_btn = RoundedButton(button_row, "START DOWNLOAD", self.start_download_thread,
                                      bg_color=self.accent_purple, fg_color="white",
                                      hover_color="#d8b4fe", font=("Segoe UI", 14, "bold"),
                                      width=240, height=52,
                                      gradient_colors=("#8A2BE2", "#EC4899"),
                                      glow_color="#c084fc", highlightbackground=self.bg_dark)
        self.start_btn.grid(row=0, column=0, sticky="ew", padx=(0, 12))

        # Stop button (ghost style) sits to the right
        self.stop_btn = RoundedButton(button_row, "STOP", self.stop_download,
                                     bg_color="#7f1d1d", fg_color="white",
                                     font=("Segoe UI", 10, "bold"),
                                     width=140, height=52, border_color=None)
        self.stop_btn.grid(row=0, column=1)
        self.stop_btn.config_state("disabled")

        # Progress bar (thicker, rounded)
        progress_container = tk.Frame(main_container, bg=self.bg_card, height=8)
        progress_container.pack(fill="x", pady=(10, 0))
        progress_container.pack_propagate(False)
        
        self.progress = NeonProgressBar(progress_container, height=14,
                                        colors=(self.accent_purple, self.accent_pink),
                                        bg=self.bg_card)
        self.progress.pack(fill="both", expand=True)

        # Activity log (full width)
        bottom_section = tk.Frame(main_container, bg=self.bg_dark)
        bottom_section.pack(fill="both", expand=True, pady=(15, 0))

        log_frame = RoundedCardFrame(bottom_section, bg_color=self.card_bg, corner_radius=12, padding=20)
        log_frame.pack(fill="both", expand=True)
        tk.Label(log_frame.inner, text="Activity Log", font=self.section_font,
                 bg=self.card_bg, fg=self.fg_secondary).pack(anchor="w", pady=(0, 12))
        self.activity_log = ActivityLogPane(log_frame.inner, bg_color="#000000",
                                            alt_color="#050505",
                                            text_color="#00ff00")
        self.activity_log.pack(fill="both", expand=True, padx=4, pady=(0, 8))
        self.activity_log.set_text_font_size(self.log_font_size_var.get())
        self.log("SunoSync Initialized...", "info")
        self.log("Ready to archive.", "info")
        self.toggle_authorization(expand=True)
        self.update_status("Ready")

    def create_card(self, parent, title, collapsed=True):
        card = CollapsibleCard(parent, title=title, bg_color=self.card_bg,
                               corner_radius=12, padding=10, collapsed=collapsed)
        card.pack(fill="x", pady=(0, 10))
        card.body.columnconfigure(0, weight=1)
        return card

    def toggle_authorization(self, expand=True):
        if expand:
            self.auth_card.set_collapsed(False)
        else:
            self.auth_card.set_collapsed(True)
    
    def create_toggle_option(self, parent, text, variable):
        row = tk.Frame(parent, bg=self.card_bg)
        row.pack(fill="x", pady=5)
        
        toggle = ToggleSwitch(row, variable)
        toggle.pack(side=tk.LEFT, padx=(0, 10))
        
        label = tk.Label(row, text=text, font=("Segoe UI", 10),
                        bg=self.card_bg, fg=self.fg_primary)
        label.pack(side=tk.LEFT)
        
        return row  # Return row for tooltip attachment
    
    def validate_page_range(self):
        """Ensure start page doesn't exceed max page"""
        start = self.start_page_var.get()
        max_pages = self.max_pages_var.get()
        
        if max_pages > 0 and start > max_pages:
            self.start_page_var.set(max_pages)
            self.log(f"Start page adjusted to {max_pages} (cannot exceed max pages)", "info")

    def on_log_font_size_change(self, *args):
        raw = self.log_font_size_var.get()
        try:
            size = int(raw)
        except (ValueError, TypeError):
            size = 12
        size = max(8, min(18, size))
        if size != raw:
            self.log_font_size_var.set(size)
            return
        if hasattr(self, "activity_log"):
            self.activity_log.set_text_font_size(size)

    def toggle_token_visibility(self):
        if self.token_entry.cget("show") == "●":
            self.token_entry.config(show="")
            self.show_token_btn.config(text="🙈")
        else:
            self.token_entry.config(show="●")
            self.show_token_btn.config(text="👁")

    def update_status(self, text, color=None):
        status_text = text
        status_lower = status_text.lower()
        color_map = {
            "ready": "#00ff00",
            "downloading": "#ff00ff",
            "stopped": "#f87171",
            "complete": "#10b981"
        }
        resolved_color = color_map.get(status_lower, color or "#6b7280")
        self.status_label.config(text=status_text, fg=resolved_color)
        self.status_dot.itemconfig(self.status_indicator, fill=resolved_color)
        if "downloading" in status_lower:
            if self._status_pulse_job is None:
                self._pulse_status()
        else:
            if self._status_pulse_job:
                self.root.after_cancel(self._status_pulse_job)
                self._status_pulse_job = None
            self._status_pulse_on = False
            self.status_dot.itemconfig(self.status_indicator, fill=resolved_color)

    def _pulse_status(self):
        if self._status_pulse_job:
            self.root.after_cancel(self._status_pulse_job)
        self._status_pulse_on = not self._status_pulse_on
        base_color = "#ff00ff"
        highlight = "#ffffff"
        fill_color = highlight if self._status_pulse_on else base_color
        self.status_dot.itemconfig(self.status_indicator, fill=fill_color)
        self._status_pulse_job = self.root.after(400, self._pulse_status)

    def open_folder(self):
        folder = self.path_var.get()
        if os.path.exists(folder):
            os.startfile(folder)
        else:
            messagebox.showwarning("Error", "Folder does not exist yet.")

    def fetch_thumbnail_bytes(self, url, size=40):
        try:
            resp = requests.get(url, timeout=8)
            resp.raise_for_status()
            img = Image.open(BytesIO(resp.content))
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            return buffer.getvalue()
        except:
            return None

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    config = json.load(f)
                    self.token_var.set(config.get("token", ""))
                    self.path_var.set(config.get("path", os.path.join(base_path, "Suno_Downloads")))
                    self.embed_thumb_var.set(config.get("embed_metadata", True))
                    self.organize_var.set(config.get("organize", False))
                    self.max_pages_var.set(config.get("max_pages", 0))
                    self.start_page_var.set(config.get("start_page", 1))
                self.log_font_size_var.set(config.get("log_font_size", self.log_font_size_var.get()))
            except:
                pass
        self.on_log_font_size_change()

    def save_config(self):
        config = {
            "token": self.token_var.get(),
            "path": self.path_var.get(),
            "embed_metadata": self.embed_thumb_var.get(),
            "organize": self.organize_var.get(),
            "max_pages": self.max_pages_var.get(),
            "start_page": self.start_page_var.get()
        }
        config["log_font_size"] = self.log_font_size_var.get()
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(config, f)
        except:
            pass

    def log(self, message, tag=None, thumbnail_data=None):
        status = tag
        if status is None:
            if message.startswith("✓"):
                status = "success"
            elif "downloading" in message.lower():
                status = "downloading"
            elif "error" in message.lower():
                status = "error"
            elif "skipping" in message.lower():
                status = "info"

        def append():
            if hasattr(self, 'activity_log'):
                self.activity_log.add_entry(message, status=status, thumbnail_data=thumbnail_data)
        self.root.after(0, append)

    def _show_message(self, func, *args, **kwargs):
        def _show():
            try:
                func(*args, **kwargs)
            except Exception:
                pass
        self.root.after(0, _show)

    def browse_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.path_var.set(folder)
            self.update_path_display()
            # Update tooltip
            if hasattr(self, 'path_entry'):
                self.create_tooltip(self.path_entry, "Full path: " + folder)

    def get_token_logic(self):
        self.log("Opening Suno in your default browser...", "info")
        webbrowser.open("https://suno.com")
        
        dialog = tk.Toplevel(self.root)
        dialog.title("Get Token")
        dialog.geometry("600x450")
        dialog.configure(bg=self.bg_dark)
        dialog.transient(self.root)
        dialog.grab_set()
        
        tk.Label(dialog, text="INSTRUCTIONS", font=("Segoe UI", 14, "bold"), 
                bg=self.bg_dark, fg=self.fg_primary).pack(pady=15)
        
        steps = (
            "1. Log in to Suno in the opened browser tab.\n"
            "2. Press F12 to open Developer Tools.\n"
            "3. Go to the 'Console' tab.\n"
            "4. Copy the code below and paste it, then press Enter."
        )
        tk.Label(dialog, text=steps, justify=tk.LEFT, font=("Segoe UI", 10), 
                bg=self.bg_dark, fg=self.fg_primary).pack(pady=10, padx=20, anchor="w")
        
        code = "window.Clerk.session.getToken().then(t => prompt('Copy this token:', t))"
        
        code_container = tk.Frame(dialog, bg=self.bg_input, highlightbackground=self.border_subtle, highlightthickness=1)
        code_container.pack(fill="x", padx=20, pady=10)
        
        code_entry = tk.Entry(code_container, font=("Consolas", 10), fg=self.accent_purple, 
                             bg="#2d2d2d", relief="flat", bd=0, highlightthickness=0)
        code_entry.insert(0, code)
        code_entry.config(state="readonly")
        code_entry.pack(side=tk.LEFT, fill="x", expand=True, padx=10, pady=10)
        
        def copy_code():
            pyperclip.copy(code)
            btn_copy.config(text="Copied!")
            dialog.after(2000, lambda: btn_copy.config(text="Copy"))
            
        btn_copy = RoundedButton(code_container, "Copy", copy_code,
                                bg_color=self.accent_purple, fg_color="white",
                                hover_color="#9d6fff", font=("Segoe UI", 9, "bold"),
                                width=80, height=30)
        btn_copy.pack(side=tk.LEFT, padx=10)
        copy_code()
        
        tk.Label(dialog, text="5. Copy the token from the browser popup.\n6. Paste it below:", 
                font=("Segoe UI", 10), bg=self.bg_dark, fg=self.fg_primary, 
                justify=tk.LEFT).pack(pady=15, padx=20, anchor="w")
        
        token_container = tk.Frame(dialog, bg=self.bg_input, highlightbackground=self.border_subtle, highlightthickness=1)
        token_container.pack(fill="x", padx=20, pady=5)
        
        token_input = tk.Entry(token_container, bg="#2d2d2d", fg=self.fg_primary, 
                              insertbackground=self.fg_primary, relief="flat", bd=0, highlightthickness=0)
        token_input.pack(fill="x", padx=5, pady=5)
        token_input.focus_set()
        
        def submit():
            t = token_input.get().strip()
            if t:
                self.token_var.set(t)
                self.log("Token set successfully!", "success")
                self.save_config()
                dialog.destroy()
            else:
                messagebox.showwarning("Input Required", "Please paste the token.")
        
        submit_btn = RoundedButton(dialog, "Submit Token", submit,
                                  bg_color=self.accent_purple, fg_color="white",
                                  hover_color="#9d6fff", font=("Segoe UI", 11, "bold"),
                                  width=200, height=45)
        submit_btn.pack(pady=15)
        
        self.root.wait_window(dialog)

    def start_download_thread(self):
        self.log("Start download requested...", "info")
        token = self.token_var.get().strip()
        if not token:
            messagebox.showerror("Error", "Please enter a Bearer Token.")
            return

        self.stop_event = False
        self.save_config()
        self.toggle_action_buttons(downloading=True)
        self.update_status("Downloading")
        self.progress.start(10)
        threading.Thread(target=self.run_download, daemon=True).start()

    def stop_download(self):
        self.stop_event = True
        self.log("Stopping... please wait.", "info")
        self.stop_btn.config_state("disabled")

    def download_single_song(self, clip, directory, headers, token, existing_uuids):
        if self.stop_event: return
        
        uuid = clip.get("id")
        
        if uuid in existing_uuids:  # Always skip existing
            self.log(f"Skipping: {clip.get('title') or uuid}", "info")
            return

        title = clip.get("title") or uuid
        audio_url = clip.get("audio_url")
        image_url = clip.get("image_url")
        display_name = clip.get("display_name")
        
        metadata = clip.get("metadata", {})
        prompt = metadata.get("prompt", "")
        tags = metadata.get("tags", "")
        created_at = clip.get("created_at", "")
        year = created_at[:4] if created_at else None
        lyrics = metadata.get("lyrics") or metadata.get("text")
        
        if not audio_url: return
        
        # Organization
        target_dir = directory
        if self.organize_var.get() and created_at:
            try:
                month_folder = created_at[:7]
                target_dir = os.path.join(directory, month_folder)
                if not os.path.exists(target_dir): os.makedirs(target_dir)
            except:
                pass

        fname = sanitize_filename(title) + ".mp3"
        out_path = os.path.join(target_dir, fname)
        
        if os.path.exists(out_path):
            out_path = get_unique_filename(out_path)
        
        thumb_data = self.fetch_thumbnail_bytes(image_url) if image_url else None
        self.log(f"Downloading: {title}", "downloading", thumbnail_data=thumb_data)
        
        # Retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with requests.get(audio_url, stream=True, headers=headers, timeout=60) as r_dl:
                    r_dl.raise_for_status()
                    with open(out_path, "wb") as f:
                        for chunk in r_dl.iter_content(chunk_size=8192):
                            if self.stop_event:
                                f.close()
                                os.remove(out_path)
                                return
                            f.write(chunk)
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    self.log(f"  Retry {attempt+1}/{max_retries}...", "info")
                    time.sleep(2)
                else:
                    self.log(f"Failed: {title} - {e}", "error")
                    return

        try:
            if lyrics:
                txt_path = os.path.splitext(out_path)[0] + ".txt"
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(lyrics)
            
            if self.embed_thumb_var.get():
                embed_metadata(
                    mp3_path=out_path, image_url=image_url, title=title, artist=display_name,
                    genre=tags, year=year, comment=prompt, lyrics=lyrics, uuid=uuid, token=token
                )
            
            existing_uuids.add(uuid)
            self.log(f"✓ {title}", "success", thumbnail_data=thumb_data)
        except Exception as e:
            self.log(f"  Metadata error: {e}", "error")

    def run_download(self):
        self.log("run_download invoked", "info")
        token = self.token_var.get().strip()
        if not token:
            self.log("Token missing; download halted.", "error")
            self.reset_ui()
            return

        directory = self.path_var.get()
        if not os.path.exists(directory): os.makedirs(directory)
        
        self.log("Scanning existing files...", "info")
        existing_uuids = get_downloaded_uuids(directory)
        self.log(f"Found {len(existing_uuids)} existing songs.", "info")
        
        try:
            self.log("Fetching song list...", "info")
            base_api_url = "https://studio-api.prod.suno.com/api/feed/v2?hide_disliked=true&hide_gen_stems=true&hide_studio_clips=true&page="
            headers = {"Authorization": f"Bearer {token}"}
            
            max_pages = self.max_pages_var.get()
            page_num = self.start_page_var.get()  # Start from user-specified page
            with ThreadPoolExecutor(max_workers=3) as executor:
                while not self.stop_event:
                    # Check max pages limit
                    if max_pages > 0 and page_num > max_pages:
                        self.log(f"Reached max pages limit ({max_pages}). Stopping.", "info")
                        break
                    
                    self.log(f"Page {page_num}...", "info")
                    
                    try:
                        r = requests.get(f"{base_api_url}{page_num}", headers=headers, timeout=15)
                        if r.status_code == 401:
                            self.log("Error: Token expired.", "error")
                            break
                        r.raise_for_status()
                        data = r.json()
                    except Exception as e:
                        tb = traceback.format_exc()
                        self.log(f"Request failed: {e}\n{tb}", "error")
                        break

                    clips = data if isinstance(data, list) else data.get("clips", [])
                    if not clips:
                        self.log("No more songs found.", "info")
                        break
                    
                    futures = []
                    for clip in clips:
                        if self.stop_event: break
                        futures.append(executor.submit(self.download_single_song, clip, directory, headers, token, existing_uuids))
                    
                    for f in futures:
                        f.result()
                        if self.stop_event: break
                    
                    page_num += 1
                    time.sleep(1)

            if self.stop_event:
                self.log("Download Stopped.", "info")
                self.update_status("Stopped")
            else:
                self.log("Download Complete!", "success")
                self.update_status("Complete")
                self._show_message(messagebox.showinfo, "Done", "Download Complete!")
            
        except Exception as e:
            tb = traceback.format_exc()
            self.log(f"Critical Error: {e}\n{tb}", "error")
            self._show_message(messagebox.showerror, "Error", str(e))
        finally:
            self.reset_ui()

    def reset_ui(self):
        self.toggle_action_buttons(downloading=False)
        self.progress.stop()
        if not self.stop_event:
            self.update_status("Ready")

    def toggle_action_buttons(self, downloading):
        """Ensure start/stop reflect the active state."""
        if downloading:
            self.start_btn.config_state("disabled")
            self.stop_btn.config_state("normal")
            self.start_btn.set_active(True)
        else:
            self.start_btn.config_state("normal")
            self.stop_btn.config_state("disabled")
            self.start_btn.set_active(False)

if __name__ == "__main__":
    root = tk.Tk()
    app = SunoApiApp(root)
    root.mainloop()
