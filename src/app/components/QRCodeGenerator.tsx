"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQRCode } from "next-qrcode";

const QR_SIZE = 280;
const LOGO_RATIO = 0.25; // logo takes up 25% of QR width (safe for errorCorrectionLevel Q)
const LOGO_PADDING = 6; // white padding around logo

export default function QRCodeGenerator() {
  const { Canvas } = useQRCode();

  const [link, setLink] = useState<string>("https://gabrielbg.com.br");
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pasteStatus, setPasteStatus] = useState<string>("");

  // Hidden QR canvas container — the library renders here
  const hiddenQrRef = useRef<HTMLDivElement>(null);
  // Visible composited canvas
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Paste helper ─────────────────────────────────────────────────────────
  const applyImageFile = useCallback((file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // ─── Global paste listener ────────────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            applyImageFile(file);
            setPasteStatus("Image pasted!");
            setTimeout(() => setPasteStatus(""), 2000);
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [applyImageFile]);

  // ─── Composite QR + logo onto displayCanvas ───────────────────────────────
  const composite = useCallback(() => {
    const srcCanvas = hiddenQrRef.current?.querySelector("canvas");
    const display = displayCanvasRef.current;
    if (!srcCanvas || !display) return;

    const ctx = display.getContext("2d");
    if (!ctx) return;

    display.width = QR_SIZE;
    display.height = QR_SIZE;

    // Draw the QR code scaled to QR_SIZE
    ctx.drawImage(srcCanvas, 0, 0, QR_SIZE, QR_SIZE);

    // Overlay the logo if one is chosen
    if (logoSrc) {
      const img = new Image();
      img.onload = () => {
        const logoSize = Math.round(QR_SIZE * LOGO_RATIO);
        const x = (QR_SIZE - logoSize) / 2;
        const y = (QR_SIZE - logoSize) / 2;

        // White rounded background so the logo doesn't bleed into modules
        const totalSize = logoSize + LOGO_PADDING * 2;
        const tx = x - LOGO_PADDING;
        const ty = y - LOGO_PADDING;
        const radius = 8;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tx + radius, ty);
        ctx.lineTo(tx + totalSize - radius, ty);
        ctx.quadraticCurveTo(tx + totalSize, ty, tx + totalSize, ty + radius);
        ctx.lineTo(tx + totalSize, ty + totalSize - radius);
        ctx.quadraticCurveTo(tx + totalSize, ty + totalSize, tx + totalSize - radius, ty + totalSize);
        ctx.lineTo(tx + radius, ty + totalSize);
        ctx.quadraticCurveTo(tx, ty + totalSize, tx, ty + totalSize - radius);
        ctx.lineTo(tx, ty + radius);
        ctx.quadraticCurveTo(tx, ty, tx + radius, ty);
        ctx.closePath();
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.restore();

        // Clip logo to rounded rect
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + logoSize - radius, y);
        ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + radius);
        ctx.lineTo(x + logoSize, y + logoSize - radius);
        ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - radius, y + logoSize);
        ctx.lineTo(x + radius, y + logoSize);
        ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, logoSize, logoSize);
        ctx.restore();
      };
      img.src = logoSrc;
    }
  }, [logoSrc]);

  // Re-composite whenever the link or logo changes.
  // We watch for the hidden canvas to appear via a MutationObserver.
  useEffect(() => {
    const container = hiddenQrRef.current;
    if (!container) return;

    const run = () => {
      // Small delay to let next-qrcode finish drawing
      setTimeout(composite, 50);
    };

    const observer = new MutationObserver(run);
    observer.observe(container, { childList: true, subtree: true, attributes: true });

    // Also run immediately in case the canvas is already present
    run();

    return () => observer.disconnect();
  }, [composite, link]);

  // ─── File pick handler ────────────────────────────────────────────────
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyImageFile(file);
  };

  const handleRemoveLogo = () => {
    setLogoSrc(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Re-composite without logo on next tick
    setTimeout(composite, 50);
  };

  // ─── Download ─────────────────────────────────────────────────────────────
  const handleDownload = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // ─── Copy ─────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) { setCopyStatus("Failed to copy"); return; }
      try {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);
        setCopyStatus("Copied!");
        setTimeout(() => setCopyStatus(""), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        setCopyStatus("Error");
      }
    }, "image/png");
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 max-w-md w-full transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">QR Generator</h2>

      {/* URL Input */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Destination URL
        </label>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter a URL..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Logo Upload */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Center Logo <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
        </label>

        {logoSrc ? (
          // Preview + remove button when a logo is set
          <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Logo preview"
              className="w-10 h-10 rounded-md object-contain border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
              {logoFile?.name ?? "Uploaded logo"}
            </span>
            <button
              onClick={handleRemoveLogo}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload image (PNG, SVG, JPG…)
            </button>
            <p className="mt-1.5 text-center text-xs text-gray-400 dark:text-gray-500">
              {pasteStatus
                ? <span className="text-green-600 dark:text-green-400 font-medium">{pasteStatus}</span>
                : <>or press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-300 font-mono">Ctrl+V</kbd> to paste</>}
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePick}
        />
      </div>

      {/* Hidden QR canvas — rendered by the library */}
      <div ref={hiddenQrRef} style={{ display: "none" }} aria-hidden="true">
        <Canvas
          text={link || " "}
          options={{
            errorCorrectionLevel: "Q",
            margin: 2,
            scale: 6,
            width: QR_SIZE,
            color: { dark: "#000000", light: "#FFFFFF" },
          }}
        />
      </div>

      {/* Visible composited canvas */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-center">
        <canvas
          ref={displayCanvasRef}
          width={QR_SIZE}
          height={QR_SIZE}
          style={{ width: QR_SIZE, height: QR_SIZE }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium rounded-lg transition active:scale-95 border border-transparent dark:border-gray-700"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copyStatus || "Copy Image"}
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-medium rounded-lg transition active:scale-95"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Save
        </button>
      </div>
    </div>
  );
}
