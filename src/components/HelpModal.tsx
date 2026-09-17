import React from 'react';
import { X, CheckCircle2, HelpCircle, Layers, Maximize2, Shield } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>How "squareimage by bijit" Works</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-sky-950/40 border border-sky-500/20 rounded-xl p-3.5 space-y-1">
            <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Core Principle: 1:1 Whiteboard (Zero Cropping)
            </h4>
            <p className="text-slate-300">
              When converting rectangular images (e.g. 16:9 landscape or 9:16 portrait) to a 1:1 square, conventional tools crop the sides or top, losing important visual details.
              <br /><br />
              <strong className="text-sky-300">squareimage by bijit</strong> never crops your images. Instead, it places the complete, uncropped image in the center of a clean 1:1 whiteboard canvas, creating a crisp, gallery-ready square asset.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider text-slate-400">
              Key Features:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Single &amp; Batch Conversion:</strong> Drop a single photo or dozens of images at once. All convert simultaneously on your GPU.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Custom Whiteboard Colors:</strong> Pure White (default), Soft White, Black, Dark Slate, custom HEX, or artistic Blurred Image background.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Margin &amp; Framing:</strong> Add custom padding (0% to 30%) and optional rounded corners or studio drop shadow.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Click ZIP Download:</strong> Save individual images or package the entire batch into a clean ZIP file.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Windows Software Package:</strong> Install as native Windows desktop app via PWA, or download the PyInstaller batch builder to generate <code className="text-sky-300">squareimage by bijit.exe</code>.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
