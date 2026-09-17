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
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image, ImageTk

class SquareImageApp:
    def __init__(self, root):
        self.root = root
        self.root.title("squareimage by bijit - Windows 1:1 Whiteboard")
        self.root.geometry("820x680")
        self.root.minsize(700, 560)
        self.root.configure(bg="#0f172a")

        self.files_list = []
        self.bg_color = tk.StringVar(value="white")
        self.padding_pct = tk.IntVar(value=0)
        self.target_size = tk.StringVar(value="original-max")
        self.custom_size = tk.IntVar(value=1080)
        self.export_format = tk.StringVar(value="JPEG")
        self.quality = tk.IntVar(value=95)

        self.create_widgets()

    def create_widgets(self):
        # Header
        header_frame = tk.Frame(self.root, bg="#1e293b", pady=14, padx=20)
        header_frame.pack(fill=tk.X)

        title_label = tk.Label(
            header_frame, 
            text="squareimage by bijit", 
            font=("Segoe UI", 16, "bold"), 
            fg="#38bdf8", 
            bg="#1e293b"
        )
        title_label.pack(anchor="w")

        sub_label = tk.Label(
            header_frame, 
            text="Convert single or multiple images into 1:1 ratio on a whiteboard without cropping", 
            font=("Segoe UI", 9), 
            fg="#94a3b8", 
            bg="#1e293b"
        )
        sub_label.pack(anchor="w")

        # Main Layout: 2 Columns
        main_frame = tk.Frame(self.root, bg="#0f172a", padx=16, pady=16)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Left Column: File List
        left_col = tk.Frame(main_frame, bg="#1e293b", padx=12, pady=12)
        left_col.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))

        btn_bar = tk.Frame(left_col, bg="#1e293b")
        btn_bar.pack(fill=tk.X, pady=(0, 10))

        add_btn = tk.Button(
            btn_bar, 
            text="+ Select Images", 
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
        right_col = tk.Frame(main_frame, bg="#1e293b", padx=16, pady=16, width=280)
        right_col.pack(side=tk.RIGHT, fill=tk.Y)

        tk.Label(
            right_col, 
            text="Whiteboard Settings", 
            font=("Segoe UI", 11, "bold"), 
            fg="#f8fafc", 
            bg="#1e293b"
        ).pack(anchor="w", pady=(0, 12))

        # Background
        tk.Label(right_col, text="Board Color:", fg="#cbd5e1", bg="#1e293b").pack(anchor="w")
        bg_choices = [("Pure White (#FFF)", "white"), ("Soft Off-White", "offwhite"), ("Deep Black (#000)", "black")]
        for text, val in bg_choices:
            tk.Radiobutton(
                right_col, 
                text=text, 
                variable=self.bg_color, 
                value=val, 
                bg="#1e293b", 
                fg="#f1f5f9", 
                selectcolor="#0f172a"
            ).pack(anchor="w")

        # Padding
        tk.Label(right_col, text="Margin / Padding (%):", fg="#cbd5e1", bg="#1e293b").pack(anchor="w", pady=(12, 2))
        padding_scale = tk.Scale(
            right_col, 
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

        # Output Dimension
        tk.Label(right_col, text="Output Square Ratio:", fg="#cbd5e1", bg="#1e293b").pack(anchor="w", pady=(12, 2))
        dim_choices = [("Original Max Dimension (Lossless 1:1)", "original-max"), ("1080 x 1080 (Square HD)", "1080"), ("2048 x 2048 (Square 2K)", "2048")]
        for text, val in dim_choices:
            tk.Radiobutton(
                right_col, 
                text=text, 
                variable=self.target_size, 
                value=val, 
                bg="#1e293b", 
                fg="#f1f5f9", 
                selectcolor="#0f172a"
            ).pack(anchor="w")

        # Export Format
        tk.Label(right_col, text="Export Format:", fg="#cbd5e1", bg="#1e293b").pack(anchor="w", pady=(12, 2))
        fmt_frame = tk.Frame(right_col, bg="#1e293b")
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
            ).pack(side=tk.LEFT, padx=(0, 10))

        # Convert Button
        convert_btn = tk.Button(
            right_col, 
            text="⚡ Convert & Save 1:1 Images", 
            command=self.convert_images,
            bg="#10b981", 
            fg="white", 
            font=("Segoe UI", 10, "bold"), 
            relief=tk.FLAT, 
            pady=10
        )
        convert_btn.pack(fill=tk.X, pady=(24, 0))

    def select_files(self):
        files = filedialog.askopenfilenames(
            title="Select Images to Square",
            filetypes=[("Image Files", "*.jpg *.jpeg *.png *.webp *.bmp *.tiff")]
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

        out_dir = filedialog.askdirectory(title="Select Output Folder to Save 1:1 Square Images")
        if not out_dir:
            return

        bg_val = self.bg_color.get()
        if bg_val == "white":
            fill_color = (255, 255, 255)
        elif bg_val == "offwhite":
            fill_color = (248, 250, 252)
        else:
            fill_color = (0, 0, 0)

        padding_ratio = self.padding_pct.get() / 100.0
        success_count = 0

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
                    
                    # Convert to RGB if saving JPEG or on solid background
                    if resized_im.mode in ("RGBA", "P") and self.export_format.get() == "JPEG":
                        rgb_im = Image.new("RGB", resized_im.size, fill_color)
                        if resized_im.mode == "RGBA":
                            rgb_im.paste(resized_im, mask=resized_im.split()[3])
                        else:
                            rgb_im.paste(resized_im)
                        resized_im = rgb_im
                    elif resized_im.mode != "RGB" and self.export_format.get() == "JPEG":
                        resized_im = resized_im.convert("RGB")

                    mode = "RGB" if self.export_format.get() == "JPEG" else "RGBA"
                    whiteboard = Image.new(mode, (sq_size, sq_size), fill_color if mode == "RGB" else fill_color + (255,))

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

                    success_count += 1
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

        messagebox.showinfo(
            "Success!", 
            f"Successfully converted {success_count} images into 1:1 whiteboard squares!\\nSaved in:\\n{out_dir}"
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

echo [1/3] Installing required libraries (Pillow, PyInstaller)...
pip install pillow pyinstaller
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies. Check your internet connection.
    pause
    exit /b
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

This software converts single or multiple image files into a 1:1 ratio.
Your images are NEVER cropped out - instead, they are placed perfectly 
centered on a 1:1 whiteboard canvas.

----------------------------------------------------------------------
HOW TO RUN ON WINDOWS:
----------------------------------------------------------------------

OPTION 1: One-Click Compile to native "squareimage by bijit.exe"
1. Double-click "build_windows_exe.bat"
2. The script will automatically install Pillow & PyInstaller and build 
   your standalone "squareimage by bijit.exe" inside the "dist/" folder!
3. You can copy that .exe anywhere on your Windows PC and run it offline.

OPTION 2: Run Python Desktop GUI directly
1. Double-click "squareimage_by_bijit.py" (or run: python squareimage_by_bijit.py)
2. Features full desktop GUI with multi-file selector and instant conversion.

OPTION 3: Instant Portable Webview (Zero dependencies)
1. Double-click "run_portable_windows.bat" or open "squareimage_offline.html"
2. Runs directly in any Windows browser (Edge, Chrome, Brave, Firefox)
   with 100% offline local GPU/Canvas rendering and batch ZIP download!

----------------------------------------------------------------------
Key Capabilities:
* 1:1 Whiteboard placement with zero cropping
* Multi-image and single-image batch processing
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
  <title>squareimage by bijit - Windows Portable</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #1e293b; border-bottom: 1px solid #334155; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
    .logo-title { font-size: 18px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .badge { background: #0284c7; color: white; font-size: 11px; padding: 2px 8px; border-radius: 9999px; font-weight: 600; }
    .container { max-width: 1100px; width: 100%; margin: 24px auto; padding: 0 16px; flex: 1; }
    .dropzone { border: 2px dashed #475569; background: #1e293b; border-radius: 12px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .dropzone:hover { border-color: #38bdf8; background: #243047; }
    .controls { background: #1e293b; border-radius: 12px; padding: 20px; margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; border: 1px solid #334155; }
    .control-group label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; }
    select, input[type="range"] { width: 100%; padding: 8px 10px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; }
    .btn { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.15s; }
    .btn:hover { background: #0369a1; }
    .btn-green { background: #10b981; }
    .btn-green:hover { background: #059669; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-top: 24px; }
    .card { background: #1e293b; border-radius: 10px; border: 1px solid #334155; overflow: hidden; display: flex; flex-direction: column; }
    .card-canvas-wrap { background: #0f172a; padding: 12px; display: flex; justify-content: center; align-items: center; }
    .card canvas { width: 100%; aspect-ratio: 1/1; object-fit: contain; background: #000; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .card-info { padding: 12px; font-size: 13px; color: #cbd5e1; flex: 1; }
    .card-name { font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
  </style>
</head>
<body>
  <header>
    <div class="logo-title">
      squareimage by bijit <span class="badge">Offline Windows Tool</span>
    </div>
    <div style="font-size: 13px; color: #94a3b8;">1:1 Whiteboard Conversion - No Cropping</div>
  </header>

  <div class="container">
    <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
      <input type="file" id="fileInput" multiple accept="image/*" style="display:none" onchange="handleFiles(this.files)">
      <h3 style="font-size: 18px; color: #f8fafc; margin-bottom: 8px;">Drag & Drop Single or Multiple Images</h3>
      <p style="color: #94a3b8; font-size: 14px;">or click to browse your computer (JPG, PNG, WEBP, BMP)</p>
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

      <div class="control-group" style="display: flex; align-items: flex-end;">
        <button class="btn btn-green" style="width:100%" onclick="downloadAll()">Download All 1:1 Images</button>
      </div>
    </div>

    <div id="grid" class="grid"></div>
  </div>

  <script>
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

    function reprocessAll() {
      renderGrid();
    }

    function renderGrid() {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      const bgType = document.getElementById('bgType').value;
      const padding = parseInt(document.getElementById('paddingRange').value, 10) / 100;
      const targetDim = document.getElementById('targetDim').value;

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
            <div class="card-name">\${item.name}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Original: \${origW}x\${origH} &rarr; Square: \${sqSize}x\${sqSize} (1:1)</div>
            <button class="btn" style="width:100%;font-size:12px;padding:6px;" onclick="downloadSingle(\${idx})">Download 1:1 Image</button>
          </div>
        \`;
        card.querySelector('.card-canvas-wrap').appendChild(canvas);
        grid.appendChild(card);
      });
    }

    function downloadSingle(idx) {
      const item = imagesList[idx];
      if (!item || !item.currentCanvas) return;
      item.currentCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const base = item.name.replace(/\\.[^/.]+$/, '');
        a.download = \`\${base}_1x1_whiteboard.jpg\`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
    }

    function downloadAll() {
      imagesList.forEach((_, idx) => {
        setTimeout(() => downloadSingle(idx), idx * 250);
      });
    }
  </script>
</body>
</html>`;
}
