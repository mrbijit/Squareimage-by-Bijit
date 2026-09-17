import React, { useState } from 'react';
import {
  X,
  Monitor,
  Package,
  Terminal,
  Download,
  CheckCircle2,
  ExternalLink,
  Code,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  generateWindowsPackageZip,
  PYTHON_GUI_SCRIPT,
  BUILD_EXE_BAT,
  generateOfflineHtml,
} from '../utils/windowsBundle';
import { downloadBlob } from '../utils/zipGenerator';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({ isOpen, onClose }) => {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedTab, setCopiedTab] = useState<'pwa' | 'pyinstaller' | 'offline'>('pyinstaller');

  if (!isOpen) return null;

  const handleDownloadZipPackage = async () => {
    try {
      setIsDownloadingZip(true);
      const zipBlob = await generateWindowsPackageZip();
      downloadBlob(zipBlob, 'squareimage_by_bijit_windows_bundle.zip');
    } catch (err) {
      console.error('Failed to generate Windows package', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDownloadPythonScript = () => {
    const blob = new Blob([PYTHON_GUI_SCRIPT], { type: 'text/x-python' });
    downloadBlob(blob, 'squareimage_by_bijit.py');
  };

  const handleDownloadOfflineHtml = () => {
    const html = generateOfflineHtml();
    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, 'squareimage_offline.html');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>squareimage by bijit</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono">
                  Windows Software & .EXE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Options to run or generate a standalone Windows .exe application on your PC
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Main Download Windows Package CTA */}
          <div className="bg-gradient-to-br from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Recommended Windows Package
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    Complete Standalone ZIP
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Download Windows Standalone Software Bundle
                </h4>
                <p className="text-xs text-slate-300 max-w-xl">
                  Includes the complete Python GUI app (<code className="text-sky-300">squareimage_by_bijit.py</code>), the 1-click batch compiler (<code className="text-sky-300">build_windows_exe.bat</code>) to produce your <code className="text-sky-300">.exe</code> file in seconds, and an offline portable HTML runner!
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadZipPackage}
                disabled={isDownloadingZip}
                id="btn-download-windows-bundle-zip"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-500/20 transition shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingZip ? 'Packaging ZIP...' : 'Download Windows ZIP'}</span>
              </button>
            </div>
          </div>

          {/* Three Ways to Run on Windows */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              3 Ways to Run "squareimage by bijit" on Windows:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Way 1: 1-Click PyInstaller .EXE */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-white text-xs">
                    1. Compile Native .EXE File
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Unzip the package and double-click <code className="text-sky-300">build_windows_exe.bat</code>. It uses PyInstaller to compile <code className="text-sky-300">squareimage by bijit.exe</code> into the <code className="text-sky-300">dist/</code> folder.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Native Windows .exe
                  </span>
                </div>
              </div>

              {/* Way 2: Windows PWA Desktop App */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-white text-xs">
                    2. Install as Windows App (PWA)
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Installs directly to your Windows Start Menu, Taskbar, and Desktop. Launches in an isolated native desktop window powered by Edge/Chrome.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  {isInstallable ? (
                    <button
                      type="button"
                      onClick={install}
                      className="w-full py-1 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white transition text-center"
                    >
                      Install Windows App
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      In Edge/Chrome: click <strong>Install App</strong> in address bar
                    </span>
                  )}
                </div>
              </div>

              {/* Way 3: Offline Standalone Single-File */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-white text-xs">
                    3. Zero-Install Offline Runner
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Double-click <code className="text-emerald-300">run_portable_windows.bat</code>. Works completely offline with zero installation or setup required.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={handleDownloadOfflineHtml}
                    className="w-full py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    Download Offline .HTML
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PyInstaller Command Reference */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                <span>Command to Build .EXE Manually in Windows Command Prompt:</span>
              </span>
              <button
                type="button"
                onClick={handleDownloadPythonScript}
                className="text-sky-400 hover:text-sky-300 text-xs font-medium underline underline-offset-2"
              >
                Download Python Script (.py)
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-lg text-sky-300 font-mono text-xs overflow-x-auto border border-slate-800 selection:bg-sky-500 selection:text-slate-950">
{`pip install pillow pyinstaller
pyinstaller --onefile --windowed --name="squareimage by bijit" squareimage_by_bijit.py`}
            </pre>
            <p className="text-[11px] text-slate-500">
              The compiled standalone executable <strong className="text-slate-300">"squareimage by bijit.exe"</strong> will be located inside the generated <code className="text-slate-400">dist/</code> folder.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Software created by Bijit • 1:1 Whiteboard Aspect Ratio Engine
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
