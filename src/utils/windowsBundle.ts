import JSZip from 'jszip';
import { downloadBlob } from './zipGenerator';

export const PYTHON_GUI_SCRIPT = `"""
squareimage by bijit
Windows Desktop GUI Software
Convert single or multiple image files into 1:1 ratio placed on a 1:1 whiteboard without cropping.
Author: Bijit
"""

import os
import sys
import zipfile
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image, ImageTk

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC_SUPPORTED = True
except Exception:
    HEIC_SUPPORTED = False

class SquareImageApp:
    def __init__(self, root):
        self.root = root
        self.root.title("squareimage by bijit - Windows 1:1 Whiteboard & Format Suite")
        self.root.geometry("880x720")
        self.root.minsize(740, 580)
        self.root.configure(bg="#0f172a")

        self.files_list = []
        self.app_mode = tk.StringVar(value="whiteboard")
        self.bg_color = tk.StringVar(value="white")
        self.padding_pct = tk.IntVar(value=0)
        self.target_size = tk.StringVar(value="original-max")
        self.custom_size = tk.IntVar(value=1080)
        self.export_format = tk.StringVar(value="JPEG")
        self.quality = tk.IntVar(value=95)
        self.save_zip = tk.BooleanVar(value=True)

        self.create_widgets()

    def create_widgets(self):
        # Header
        header_frame = tk.Frame(self.root, bg="#1e293b", pady=12, padx=20)
        header_frame.pack(fill=tk.X)

        title_row = tk.Frame(header_frame, bg="#1e293b")
        title_row.pack(fill=tk.X)

        title_label = tk.Label(
            title_row, 
            text="squareimage by bijit", 
            font=("Segoe UI", 16, "bold"), 
            fg="#38bdf8", 
            bg="#1e293b"
        )
        title_label.pack(side=tk.LEFT)

        heic_txt = "HEIC Support: Enabled" if HEIC_SUPPORTED else "Run 'pip install pillow-heif' for HEIC"
        heic_color = "#34d399" if HEIC_SUPPORTED else "#fbbf24"
        tk.Label(
            title_row,
            text=f"[{heic_txt}]",
            font=("Consolas", 9, "bold"),
            fg=heic_color,
            bg="#1e293b"
        ).pack(side=tk.LEFT, padx=(12, 0))

        sub_label = tk.Label(
            header_frame, 
            text="1:1 Whiteboard Square (No Cropping) & HEIC/All-Format to JPEG Converter", 
            font=("Segoe UI", 9), 
            fg="#94a3b8", 
            bg="#1e293b"
        )
        sub_label.pack(anchor="w", pady=(2, 0))

        # Mode Selector Tabs
        mode_frame = tk.Frame(self.root, bg="#0f172a", padx=16, pady=(10, 0))
        mode_frame.pack(fill=tk.X)

        tk.Radiobutton(
            mode_frame,
            text="1:1 Whiteboard Square",
            variable=self.app_mode,
            value="whiteboard",
            command=self.update_controls_panel,
            bg="#0f172a",
            fg="#38bdf8",
            selectcolor="#1e293b",
            font=("Segoe UI", 10, "bold")
        ).pack(side=tk.LEFT, padx=(0, 16))

        tk.Radiobutton(
            mode_frame,
            text="HEIC & All Images -> JPEG Converter",
            variable=self.app_mode,
            value="heic_to_jpeg",
            command=self.update_controls_panel,
            bg="#0f172a",
            fg="#fbbf24",
            selectcolor="#1e293b",
            font=("Segoe UI", 10, "bold")
        ).pack(side=tk.LEFT)

        # Main Layout: 2 Columns
        main_frame = tk.Frame(self.root, bg="#0f172a", padx=16, pady=12)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Left Column: File List
        left_col = tk.Frame(main_frame, bg="#1e293b", padx=12, pady=12)
        left_col.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))

        btn_bar = tk.Frame(left_col, bg="#1e293b")
        btn_bar.pack(fill=tk.X, pady=(0, 10))

        add_btn = tk.Button(
            btn_bar, 
            text="+ Select Images (HEIC, PNG, etc.)", 
            command=self.select_files,
            bg="#0284c7", 
            fg="white", 
            font=("Segoe UI", 9, "bold"), 
            relief=tk.FLAT, 
            padx=12, 
            pady=6
        )
        add_btn.pack(side=tk.LEFT, padx=(0, 6))

        clear_btn = tk.Button(
            btn_bar, 
            text="Clear All", 
            command=self.clear_files,
            bg="#334155", 
            fg="#cbd5e1", 
            font=("Segoe UI", 9), 
            relief=tk.FLAT, 
            padx=8, 
            pady=6
        )
        clear_btn.pack(side=tk.LEFT)

        self.listbox = tk.Listbox(
            left_col, 
            bg="#0f172a", 
            fg="#f8fafc", 
            selectbackground="#0369a1", 
            font=("Consolas", 9),
            relief=tk.FLAT
        )
        self.listbox.pack(fill=tk.BOTH, expand=True)

        self.count_label = tk.Label(
            left_col, 
            text="0 images loaded", 
            bg="#1e293b", 
            fg="#94a3b8", 
            font=("Segoe UI", 9)
        )
        self.count_label.pack(pady=(6, 0), anchor="w")

        # Right Column: Settings
        self.right_col = tk.Frame(main_frame, bg="#1e293b", padx=16, pady=16, width=320)
        self.right_col.pack(side=tk.RIGHT, fill=tk.Y)
        self.right_col.pack_propagate(False)

        self.update_controls_panel()

    def update_controls_panel(self):
        for child in self.right_col.winfo_children():
            child.destroy()

        mode = self.app_mode.get()

        if mode == "whiteboard":
            tk.Label(
                self.right_col, 
                text="1:1 Whiteboard Settings", 
                font=("Segoe UI", 11, "bold"), 
                fg="#f8fafc", 
                bg="#1e293b"
            ).pack(anchor="w", pady=(0, 10))

            tk.Label(self.right_col, text="Board Color:", fg="#cbd5e1", bg="#1e293b").pack(anchor="w")
            bg_choices = [("Pure White (#FFF)", "white"), ("Soft Off-White", "offwhite"), ("Deep Black (#000)", "black")]
            for text, val in bg_choices:
                tk.Radiobutton(
                    self.right_col, 
                    text=text, 
                    variable=self.bg_color, 
                    value=val, 
                    bg="#1e293b", 
                    fg="#f1f5f9", 
                    selectcolor="#0f172a"
                ).pack(anchor="w")

            tk.Label(self.right_col, text="Margin / Padding (%):", fg="#cbd5e1", bg="#1e293b").pack(anchor="w", pady=(10, 2))
            padding_scale = tk.Scale(
                self.right_col, 
                from_=0, 
                to=30, 
                orient=tk.HORIZONTAL, 
                variable=self.padding_pct, 
                bg="#1e293b", 
                fg="#f1f5f9", 
                troughcolor="#0f172a",
                highlightthickness=0
            )
            padding_scale.pack(fill=tk.X)

            tk.Label(self.right_col, text="Output Square Ratio:", fg="#cbd5e1", bg="#1e293b").pack(anchor="w", pady=(10, 2))
            dim_choices = [("Original Max (Lossless 1:1)", "original-max"), ("1080 x 1080 (Square HD)", "1080"), ("2048 x 2048 (Square 2K)", "2048")]
            for text, val in dim_choices:
                tk.Radiobutton(
                    self.right_col, 
                    text=text, 
                    variable=self.target_size, 
                    value=val, 
                    bg="#1e293b", 
                    fg="#f1f5f9", 
                    selectcolor="#0f172a"
                ).pack(anchor="w")

            tk.Label(self.right_col, text="Export Format:", fg="#cbd5e1", bg="#1e293b").pack(anchor="w", pady=(10, 2))
            fmt_frame = tk.Frame(self.right_col, bg="#1e293b")
            fmt_frame.pack(fill=tk.X)
            for fmt in ["JPEG", "PNG", "WEBP"]:
                tk.Radiobutton(
                    fmt_frame, 
                    text=fmt, 
                    variable=self.export_format, 
                    value=fmt, 
                    bg="#1e293b", 
                    fg="#f1f5f9", 
                    selectcolor="#0f172a"
                ).pack(side=tk.LEFT, padx=(0, 8))
        else:
            tk.Label(
                self.right_col, 
                text="HEIC & All -> JPEG Settings", 
                font=("Segoe UI", 11, "bold"), 
                fg="#fbbf24", 
                bg="#1e293b"
            ).pack(anchor="w", pady=(0, 10))

            desc = "Converts Apple HEIC, PNG, WEBP, BMP, and TIFF files directly to standard JPEG (.jpg).\\n\\n100% preserves original dimensions without cropping."
            tk.Label(self.right_col, text=desc, fg="#94a3b8", bg="#1e293b", justify=tk.LEFT, wraplength=280, font=("Segoe UI", 8)).pack(anchor="w", pady=(0, 10))

            tk.Label(self.right_col, text="JPEG Quality (%):", fg="#cbd5e1", bg="#1e293b").pack(anchor="w", pady=(4, 2))
            q_scale = tk.Scale(
                self.right_col, 
                from_=70, 
                to=100, 
                orient=tk.HORIZONTAL, 
                variable=self.quality, 
                bg="#1e293b", 
                fg="#f1f5f9", 
                troughcolor="#0f172a",
                highlightthickness=0
            )
            q_scale.pack(fill=tk.X)

        tk.Label(self.right_col, text="Save Options:", fg="#cbd5e1", bg="#1e293b", font=("Segoe UI", 9, "bold")).pack(anchor="w", pady=(12, 2))
        tk.Checkbutton(
            self.right_col,
            text="Also create a .ZIP archive",
            variable=self.save_zip,
            bg="#1e293b",
            fg="#38bdf8",
            selectcolor="#0f172a",
            font=("Segoe UI", 9)
        ).pack(anchor="w")

        btn_text = "⚡ Convert 1:1 & Save" if mode == "whiteboard" else "⚡ Convert to JPEG & Save"
        btn_color = "#10b981" if mode == "whiteboard" else "#f59e0b"
        convert_btn = tk.Button(
            self.right_col, 
            text=btn_text, 
            command=self.convert_images,
            bg=btn_color, 
            fg="white" if mode == "whiteboard" else "#0f172a", 
            font=("Segoe UI", 10, "bold"), 
            relief=tk.FLAT, 
            pady=10
        )
        convert_btn.pack(fill=tk.X, pady=(16, 0))

    def select_files(self):
        files = filedialog.askopenfilenames(
            title="Select Images (HEIC, PNG, JPG, WEBP, BMP, TIFF)",
            filetypes=[("All Supported Images", "*.heic *.heif *.jpg *.jpeg *.png *.webp *.bmp *.tiff *.tif *.avif *.gif"), ("All Files", "*.*")]
        )
        if files:
            for f in files:
                if f not in self.files_list:
                    self.files_list.append(f)
                    self.listbox.insert(tk.END, f"{os.path.basename(f)}  ({f})")
            self.count_label.config(text=f"{len(self.files_list)} images loaded")

    def clear_files(self):
        self.files_list.clear()
        self.listbox.delete(0, tk.END)
        self.count_label.config(text="0 images loaded")

    def convert_images(self):
        if not self.files_list:
            messagebox.showwarning("No Images", "Please select at least one image file first.")
            return

        mode = self.app_mode.get()
        prompt_title = "Select Output Folder for 1:1 Images" if mode == "whiteboard" else "Select Output Folder for JPEGs"
        out_dir = filedialog.askdirectory(title=prompt_title)
        if not out_dir:
            return

        success_count = 0
        saved_files = []

        if mode == "whiteboard":
            bg_val = self.bg_color.get()
            if bg_val == "white":
                fill_color = (255, 255, 255)
            elif bg_val == "offwhite":
                fill_color = (248, 250, 252)
            else:
                fill_color = (0, 0, 0)

            padding_ratio = self.padding_pct.get() / 100.0

            for file_path in self.files_list:
                try:
                    with Image.open(file_path) as im:
                        orig_w, orig_h = im.size
                        
                        if self.target_size.get() == "1080":
                            sq_size = 1080
                        elif self.target_size.get() == "2048":
                            sq_size = 2048
                        else:
                            sq_size = max(orig_w, orig_h)

                        available_size = sq_size * (1.0 - padding_ratio * 2.0)
                        scale = min(available_size / orig_w, available_size / orig_h)
                        new_w = max(1, int(orig_w * scale))
                        new_h = max(1, int(orig_h * scale))

                        resized_im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
                        
                        if resized_im.mode in ("RGBA", "P") and self.export_format.get() == "JPEG":
                            rgb_im = Image.new("RGB", resized_im.size, fill_color)
                            if resized_im.mode == "RGBA":
                                rgb_im.paste(resized_im, mask=resized_im.split()[3])
                            else:
                                rgb_im.paste(resized_im)
                            resized_im = rgb_im
                        elif resized_im.mode != "RGB" and self.export_format.get() == "JPEG":
                            resized_im = resized_im.convert("RGB")

                        mode_str = "RGB" if self.export_format.get() == "JPEG" else "RGBA"
                        whiteboard = Image.new(mode_str, (sq_size, sq_size), fill_color if mode_str == "RGB" else fill_color + (255,))

                        pos_x = (sq_size - new_w) // 2
                        pos_y = (sq_size - new_h) // 2

                        if resized_im.mode == "RGBA":
                            whiteboard.paste(resized_im, (pos_x, pos_y), mask=resized_im.split()[3])
                        else:
                            whiteboard.paste(resized_im, (pos_x, pos_y))

                        base_name = os.path.splitext(os.path.basename(file_path))[0]
                        ext = self.export_format.get().lower()
                        if ext == "jpeg":
                            ext = "jpg"
                        out_filename = f"{base_name}_1x1_whiteboard.{ext}"
                        out_path = os.path.join(out_dir, out_filename)

                        if ext in ("jpg", "jpeg"):
                            whiteboard.save(out_path, quality=self.quality.get(), subsampling=0)
                        else:
                            whiteboard.save(out_path)

                        saved_files.append((out_path, out_filename))
                        success_count += 1
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
        else:
            # HEIC & All Formats to JPEG
            for file_path in self.files_list:
                try:
                    with Image.open(file_path) as im:
                        if im.mode in ("RGBA", "P"):
                            rgb_im = Image.new("RGB", im.size, (255, 255, 255))
                            if im.mode == "RGBA":
                                rgb_im.paste(im, mask=im.split()[3])
                            else:
                                rgb_im.paste(im)
                            final_im = rgb_im
                        elif im.mode != "RGB":
                            final_im = im.convert("RGB")
                        else:
                            final_im = im

                        base_name = os.path.splitext(os.path.basename(file_path))[0]
                        out_filename = f"{base_name}.jpg"
                        out_path = os.path.join(out_dir, out_filename)

                        final_im.save(out_path, format="JPEG", quality=self.quality.get(), subsampling=0)
                        saved_files.append((out_path, out_filename))
                        success_count += 1
                except Exception as e:
                    print(f"Error converting {file_path} to JPEG: {e}")

        zip_msg = ""
        if self.save_zip.get() and saved_files:
            try:
                zip_filename = "squareimage_by_bijit_all_1x1.zip" if mode == "whiteboard" else "converted_jpegs_by_bijit.zip"
                zip_path = os.path.join(out_dir, zip_filename)
                with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                    for f_path, arc_name in saved_files:
                        zf.write(f_path, arcname=arc_name)
                zip_msg = f"\\n\\nAlso created ZIP archive:\\n{zip_filename}"
            except Exception as e:
                print(f"Failed to create ZIP: {e}")

        res_desc = "1:1 whiteboard squares" if mode == "whiteboard" else "high quality JPEGs"
        messagebox.showinfo(
            "Success!", 
            f"Successfully converted {success_count} images into {res_desc}!\\nSaved in:\\n{out_dir}{zip_msg}"
        )

if __name__ == "__main__":
    root = tk.Tk()
    app = SquareImageApp(root)
    root.mainloop()
`;

export const BUILD_EXE_BAT = `@echo off
title Building squareimage by bijit.exe
color 0b
echo ======================================================================
echo          SQUAREIMAGE BY BIJIT - WINDOWS EXECUTABLE BUILDER
echo ======================================================================
echo.
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on your system!
    echo Please install Python 3.9+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b
)

echo [1/3] Installing required libraries (Pillow, Pillow-HEIF, PyInstaller)...
pip install pillow pillow-heif pyinstaller
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install all dependencies, attempting base pillow install...
    pip install pillow pyinstaller
)

echo.
echo [2/3] Compiling standalone Windows .exe file...
pyinstaller --onefile --windowed --name="squareimage by bijit" squareimage_by_bijit.py
if %errorlevel% neq 0 (
    echo [ERROR] PyInstaller compilation failed.
    pause
    exit /b
)

echo.
echo ======================================================================
echo [3/3] SUCCESS!
echo "squareimage by bijit.exe" has been created in the "dist" folder!
echo ======================================================================
echo.
explorer dist
pause
`;

export const RUN_PORTABLE_BAT = `@echo off
title squareimage by bijit - Standalone Launcher
start "" "%~dp0squareimage_offline.html"
`;

export const README_TXT = `======================================================================
               squareimage by bijit - Windows Software Package
======================================================================

Thank you for downloading "squareimage by bijit"!

This software provides two powerful offline image conversion tools:
1. 1:1 Whiteboard Placement (No Cropping)
   Single or multiple images converted to 1:1 square ratio placed on a clean
   1:1 whiteboard background. Your original content is NEVER cropped out.
2. HEIC & All Formats -> High Quality JPEG (.jpg)
   Converts Apple iPhone HEIC/HEIF photos, PNG, WEBP, BMP, and TIFF files
   directly into standard JPEG format. Save one by one or save all at once!

----------------------------------------------------------------------
HOW TO RUN ON WINDOWS:
----------------------------------------------------------------------

OPTION 1: One-Click Compile to native "squareimage by bijit.exe"
1. Double-click "build_windows_exe.bat"
2. The script will automatically install Pillow, pillow-heif & PyInstaller and build 
   your standalone "squareimage by bijit.exe" inside the "dist/" folder!
3. You can copy that .exe anywhere on your Windows PC and run it offline.

OPTION 2: Run Python Desktop GUI directly
1. Double-click "squareimage_by_bijit.py" (or run: python squareimage_by_bijit.py)
2. Features full desktop GUI with multi-file selector, mode switcher, instant conversion,
   and automatic .ZIP bundle packaging!

OPTION 3: Instant Portable Webview (Zero dependencies)
1. Double-click "run_portable_windows.bat" or open "squareimage_offline.html"
2. Runs directly in any Windows browser (Edge, Chrome, Brave, Firefox)
   with 100% offline local GPU/Canvas rendering and "Download All as ZIP" support!

----------------------------------------------------------------------
Key Capabilities:
* 1:1 Whiteboard placement with zero cropping
* HEIC, HEIF, PNG, WEBP, BMP, TIFF to JPEG conversion
* Multi-image and single-image batch processing
* Save one by one or download all converted images as a single .ZIP archive
* Custom whiteboard backgrounds (Pure White, Off-White, Black, Slate, Blur)
* Adjustable padding, corner radius, and drop shadow
* Export to JPG, PNG, WEBP with high-res lossless scaling

Created by Bijit
`;

export async function generateWindowsPackageZip(): Promise<Blob> {
  const zip = new JSZip();

  zip.file('squareimage_by_bijit.py', PYTHON_GUI_SCRIPT);
  zip.file('build_windows_exe.bat', BUILD_EXE_BAT);
  zip.file('run_portable_windows.bat', RUN_PORTABLE_BAT);
  zip.file('README.txt', README_TXT);

  // Generate offline standalone HTML tool
  const offlineHtml = generateOfflineHtml();
  zip.file('squareimage_offline.html', offlineHtml);

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function generateOfflineHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>squareimage by bijit - Windows Portable Offline Edition</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #1e293b; border-bottom: 1px solid #334155; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
    .logo-title { font-size: 18px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .badge { background: #0284c7; color: white; font-size: 11px; padding: 2px 8px; border-radius: 9999px; font-weight: 600; }
    .offline-badge { background: #059669; color: #ecfdf5; font-size: 11px; padding: 2px 10px; border-radius: 9999px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
    .container { max-width: 1100px; width: 100%; margin: 24px auto; padding: 0 16px; flex: 1; }
    .dropzone { border: 2px dashed #475569; background: #1e293b; border-radius: 12px; padding: 36px 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .dropzone:hover { border-color: #38bdf8; background: #243047; }
    .controls { background: #1e293b; border-radius: 12px; padding: 20px; margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; border: 1px solid #334155; }
    .control-group label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; }
    select, input[type="range"] { width: 100%; padding: 8px 10px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; }
    .btn { background: #0284c7; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
    .btn:hover { background: #0369a1; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-green { background: #10b981; }
    .btn-green:hover { background: #059669; }
    .btn-outline { background: transparent; border: 1px solid #475569; color: #cbd5e1; }
    .btn-outline:hover { background: #334155; color: white; }
    .batch-bar { margin-top: 20px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
    .card { background: #1e293b; border-radius: 10px; border: 1px solid #334155; overflow: hidden; display: flex; flex-direction: column; }
    .card-canvas-wrap { background: #0f172a; padding: 12px; display: flex; justify-content: center; align-items: center; }
    .card canvas { width: 100%; aspect-ratio: 1/1; object-fit: contain; background: #000; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .card-info { padding: 12px; font-size: 13px; color: #cbd5e1; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .card-name { font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
  </style>
</head>
<body>
  <header>
    <div class="logo-title">
      squareimage by bijit 
      <span class="badge">Windows Portable</span>
      <span class="offline-badge">&#x2714; Offline Mode Active</span>
    </div>
    <div style="font-size: 13px; color: #94a3b8;">1:1 Whiteboard Conversion • Local ZIP Download</div>
  </header>

  <div class="container">
    <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
      <input type="file" id="fileInput" multiple accept="image/*" style="display:none" onchange="handleFiles(this.files)">
      <h3 style="font-size: 18px; color: #f8fafc; margin-bottom: 8px;">Drag & Drop Single or Multiple Images</h3>
      <p style="color: #94a3b8; font-size: 14px;">or click to browse your computer (JPG, PNG, WEBP, BMP)</p>
      <div style="margin-top: 10px; font-size: 12px; color: #38bdf8;">&#x2713; 100% Offline • Zero cropping • Full batch ZIP export</div>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Whiteboard Color</label>
        <select id="bgType" onchange="reprocessAll()">
          <option value="white">Pure White (#FFFFFF)</option>
          <option value="offwhite">Soft Off-White (#F8FAFC)</option>
          <option value="black">Deep Black (#000000)</option>
          <option value="slate">Dark Slate (#0F172A)</option>
          <option value="blur">Blurred Image Background</option>
        </select>
      </div>

      <div class="control-group">
        <label>Padding Margin (%): <span id="paddingVal">0%</span></label>
        <input type="range" id="paddingRange" min="0" max="30" value="0" oninput="document.getElementById('paddingVal').innerText=this.value+'%'; reprocessAll()">
      </div>

      <div class="control-group">
        <label>Square Dimension</label>
        <select id="targetDim" onchange="reprocessAll()">
          <option value="original-max">Original Max Dimension (Lossless)</option>
          <option value="1080">1080 x 1080 (HD Square)</option>
          <option value="2048">2048 x 2048 (2K Square)</option>
        </select>
      </div>

      <div class="control-group">
        <label>Export Format</label>
        <select id="exportFormat" onchange="reprocessAll()">
          <option value="image/jpeg">JPG (Standard)</option>
          <option value="image/png">PNG (Lossless)</option>
          <option value="image/webp">WEBP (Web Modern)</option>
        </select>
      </div>
    </div>

    <!-- Batch Download Toolbar -->
    <div class="batch-bar" id="batchBar" style="display:none;">
      <div>
        <strong id="queueCount" style="color:#f8fafc; font-size: 14px;">0 images loaded</strong>
        <div style="font-size: 12px; color: #94a3b8;">All images centered on 1:1 whiteboard without cropping</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline" onclick="clearAll()">Clear All</button>
        <button class="btn btn-green" id="btnZipAll" onclick="downloadAllAsZip()">
          &#x1F4E6; Download All as ZIP (.zip)
        </button>
      </div>
    </div>

    <div id="grid" class="grid"></div>
  </div>

  <script>
    // Pure JS 100% Offline ZIP Generator (PKZIP Specification)
    class SimpleZip {
      constructor() {
        this.entries = [];
      }

      static crcTable = (() => {
        let c;
        const table = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
          c = n;
          for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
          }
          table[n] = c;
        }
        return table;
      })();

      static crc32(bytes) {
        let crc = 0 ^ (-1);
        for (let i = 0; i < bytes.length; i++) {
          crc = (crc >>> 8) ^ SimpleZip.crcTable[(crc ^ bytes[i]) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
      }

      addFile(filename, uint8Data) {
        this.entries.push({ filename, data: uint8Data });
      }

      buildBlob() {
        const encoder = new TextEncoder();
        const parts = [];
        const cdEntries = [];
        let offset = 0;

        for (const file of this.entries) {
          const nameBytes = encoder.encode(file.filename);
          const data = file.data;
          const crc = SimpleZip.crc32(data);
          const size = data.length;

          // Local file header (30 bytes + name)
          const localHeader = new Uint8Array(30 + nameBytes.length);
          const lv = new DataView(localHeader.buffer);
          lv.setUint32(0, 0x04034b50, true); // PK\x03\x04
          lv.setUint16(4, 20, true);         // version needed
          lv.setUint16(6, 0, true);          // flags
          lv.setUint16(8, 0, true);          // compression: 0 (store)
          lv.setUint16(10, 0, true);         // time
          lv.setUint16(12, 0, true);         // date
          lv.setUint32(14, crc, true);       // crc32
          lv.setUint32(18, size, true);      // compressed size
          lv.setUint32(22, size, true);      // uncompressed size
          lv.setUint16(26, nameBytes.length, true); // filename length
          lv.setUint16(28, 0, true);         // extra length
          localHeader.set(nameBytes, 30);

          parts.push(localHeader);
          parts.push(data);

          cdEntries.push({ nameBytes, crc, size, offset });
          offset += localHeader.length + data.length;
        }

        const cdOffset = offset;
        let cdSize = 0;

        for (const cd of cdEntries) {
          // Central directory header (46 bytes + name)
          const cdHeader = new Uint8Array(46 + cd.nameBytes.length);
          const cv = new DataView(cdHeader.buffer);
          cv.setUint32(0, 0x02014b50, true); // PK\x01\x02
          cv.setUint16(4, 20, true);         // version made by
          cv.setUint16(6, 20, true);         // version needed
          cv.setUint16(8, 0, true);          // flags
          cv.setUint16(10, 0, true);         // compression: 0
          cv.setUint16(12, 0, true);         // time
          cv.setUint16(14, 0, true);         // date
          cv.setUint32(16, cd.crc, true);    // crc
          cv.setUint32(20, cd.size, true);   // comp size
          cv.setUint32(24, cd.size, true);   // uncomp size
          cv.setUint16(28, cd.nameBytes.length, true);
          cv.setUint16(30, 0, true);
          cv.setUint16(32, 0, true);
          cv.setUint16(34, 0, true);
          cv.setUint16(36, 0, true);
          cv.setUint32(38, 0, true);
          cv.setUint32(42, cd.offset, true); // relative offset of local header
          cdHeader.set(cd.nameBytes, 46);

          parts.push(cdHeader);
          cdSize += cdHeader.length;
        }

        // End of central directory record (22 bytes)
        const eocd = new Uint8Array(22);
        const ev = new DataView(eocd.buffer);
        ev.setUint32(0, 0x06054b50, true); // PK\x05\x06
        ev.setUint16(4, 0, true);          // disk number
        ev.setUint16(6, 0, true);          // start disk
        ev.setUint16(8, cdEntries.length, true);
        ev.setUint16(10, cdEntries.length, true);
        ev.setUint32(12, cdSize, true);
        ev.setUint32(16, cdOffset, true);
        ev.setUint16(20, 0, true);

        parts.push(eocd);

        return new Blob(parts, { type: 'application/zip' });
      }
    }

    let imagesList = [];

    const dropzone = document.getElementById('dropzone');
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#38bdf8'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = '#475569'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#475569';
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            imagesList.push({ file, img, name: file.name });
            renderGrid();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

    function clearAll() {
      imagesList = [];
      renderGrid();
    }

    function reprocessAll() {
      renderGrid();
    }

    function renderGrid() {
      const grid = document.getElementById('grid');
      const batchBar = document.getElementById('batchBar');
      const queueCount = document.getElementById('queueCount');

      if (imagesList.length === 0) {
        batchBar.style.display = 'none';
        grid.innerHTML = '';
        return;
      }

      batchBar.style.display = 'flex';
      queueCount.innerText = imagesList.length + (imagesList.length === 1 ? ' image ready' : ' images ready');
      grid.innerHTML = '';

      const bgType = document.getElementById('bgType').value;
      const padding = parseInt(document.getElementById('paddingRange').value, 10) / 100;
      const targetDim = document.getElementById('targetDim').value;
      const format = document.getElementById('exportFormat').value;

      imagesList.forEach((item, idx) => {
        const origW = item.img.naturalWidth;
        const origH = item.img.naturalHeight;
        let sqSize = Math.max(origW, origH);
        if (targetDim === '1080') sqSize = 1080;
        if (targetDim === '2048') sqSize = 2048;

        const available = sqSize * (1 - padding * 2);
        const scale = Math.min(available / origW, available / origH);
        const drawW = Math.round(origW * scale);
        const drawH = Math.round(origH * scale);
        const drawX = Math.round((sqSize - drawW) / 2);
        const drawY = Math.round((sqSize - drawH) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = sqSize;
        canvas.height = sqSize;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        if (bgType === 'blur') {
          const cover = Math.max(sqSize / origW, sqSize / origH);
          ctx.filter = 'blur(25px) brightness(0.9)';
          ctx.drawImage(item.img, (sqSize - origW * cover) / 2, (sqSize - origH * cover) / 2, origW * cover, origH * cover);
          ctx.filter = 'none';
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillRect(0,0,sqSize,sqSize);
        } else {
          ctx.fillStyle = bgType === 'black' ? '#000000' : bgType === 'slate' ? '#0f172a' : bgType === 'offwhite' ? '#f8fafc' : '#ffffff';
          ctx.fillRect(0,0,sqSize,sqSize);
        }

        ctx.drawImage(item.img, drawX, drawY, drawW, drawH);
        item.currentCanvas = canvas;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = \`
          <div class="card-canvas-wrap"></div>
          <div class="card-info">
            <div>
              <div class="card-name">\${item.name}</div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Original: \${origW}x\${origH} &rarr; Square: \${sqSize}x\${sqSize} (1:1)</div>
            </div>
            <button class="btn" style="width:100%;font-size:12px;padding:6px;" onclick="downloadSingle(\${idx})">Download 1:1 Image</button>
          </div>
        \`;
        card.querySelector('.card-canvas-wrap').appendChild(canvas);
        grid.appendChild(card);
      });
    }

    function getExt(mime) {
      if (mime === 'image/png') return 'png';
      if (mime === 'image/webp') return 'webp';
      return 'jpg';
    }

    function downloadSingle(idx) {
      const item = imagesList[idx];
      if (!item || !item.currentCanvas) return;
      const mime = document.getElementById('exportFormat').value;
      const ext = getExt(mime);

      item.currentCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const base = item.name.replace(/\\.[^/.]+$/, '');
        a.download = \`\${base}_1x1_whiteboard.\${ext}\`;
        a.click();
        URL.revokeObjectURL(url);
      }, mime, 0.95);
    }

    // 100% Offline ZIP Creator for All Images
    async function downloadAllAsZip() {
      if (imagesList.length === 0) return;
      const btn = document.getElementById('btnZipAll');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '&#x23F3; Packing Offline ZIP...';

      try {
        const zip = new SimpleZip();
        const mime = document.getElementById('exportFormat').value;
        const ext = getExt(mime);

        for (let i = 0; i < imagesList.length; i++) {
          const item = imagesList[i];
          btn.innerHTML = \`&#x23F3; Packing ZIP (\${i + 1}/\${imagesList.length})...\`;

          const blob = await new Promise((resolve) => {
            item.currentCanvas.toBlob((b) => resolve(b), mime, 0.95);
          });

          const arrayBuffer = await blob.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          const base = item.name.replace(/\\.[^/.]+$/, '');
          const filename = \`\${base}_1x1_whiteboard.\${ext}\`;
          zip.addFile(filename, uint8);
        }

        btn.innerHTML = '&#x1F4E6; Generating ZIP file...';
        const zipBlob = zip.buildBlob();

        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`squareimage_by_bijit_all_1x1_\${Date.now()}.zip\`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);

        btn.innerHTML = '&#x2714; ZIP Downloaded!';
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }, 2000);
      } catch (err) {
        console.error('Offline zip error:', err);
        alert('Error creating ZIP archive: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  </script>
</body>
</html>`;
}
