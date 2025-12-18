"use client";

import React, { useState, useRef } from "react";
import { useQRCode } from "next-qrcode";

export default function QRCodeGenerator() {
  const { Canvas } = useQRCode();
  const [link, setLink] = useState<string>("https://gabrielbg.com.br");
  const [copyStatus, setCopyStatus] = useState<string>(""); // For user feedback

  // We need a ref to find the canvas element later
  const qrRef = useRef<HTMLDivElement>(null);

  // 1. Logic to Download the Image
  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // 2. Logic to Copy Image to Clipboard (Ctrl+V style)
  const handleCopy = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) {
        setCopyStatus("Failed to copy");
        return;
      }

      try {
        // This is the modern Clipboard API
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);

        // Show success message briefly
        setCopyStatus("Copied!");
        setTimeout(() => setCopyStatus(""), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        setCopyStatus("Error");
      }
    }, "image/png");
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border border-gray-200 rounded-xl shadow-sm bg-white max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800">QR Generator</h2>

      {/* Input Field */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination URL
        </label>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter a URL..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
        />
      </div>

      {/* QR Output Container - We attach the ref here */}
      <div
        ref={qrRef}
        className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-center"
      >
        <Canvas
          text={link || " "}
          options={{
            errorCorrectionLevel: "Q",
            margin: 2,
            scale: 6,
            width: 200,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition active:scale-95"
        >
          {/* Simple Copy Icon SVG */}
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          {copyStatus || "Copy Image"}
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition active:scale-95"
        >
          {/* Simple Download Icon SVG */}
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Save
        </button>
      </div>
    </div>
  );
}
