"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import QRCodeStyling, {
  DotType,
  CornerSquareType,
  FileExtension,
} from "qr-code-styling";
import {
  encodeWifi,
  encodeVCard,
  encodeEmail,
  encodeSms,
  WifiEncryptionType,
} from "../utils/qrFormats";
import { useLocalHistory, QRMode, HistoryEntry } from "../hooks/useLocalHistory";

// ─── Constants ────────────────────────────────────────────────────────────────
const QR_SIZE = 280;

const DOT_STYLE_OPTIONS: { value: DotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_STYLE_OPTIONS: { value: CornerSquareType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const EXPORT_FORMATS: { value: FileExtension; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "webp", label: "WEBP" },
];

const MODE_LABELS: Record<QRMode, string> = {
  url: "URL",
  wifi: "Wi-Fi",
  vcard: "vCard",
  email: "Email",
  sms: "SMS",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function QRCodeGenerator() {
  // ── QR Mode ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<QRMode>("url");

  // ── URL mode ─────────────────────────────────────────────────────────────
  const [url, setUrl] = useState("https://gabrielbg.com.br");

  // ── Wi-Fi mode ───────────────────────────────────────────────────────────
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiEnc, setWifiEnc] = useState<WifiEncryptionType>("WPA");

  // ── vCard mode ───────────────────────────────────────────────────────────
  const [vcFirst, setVcFirst] = useState("");
  const [vcLast, setVcLast] = useState("");
  const [vcPhone, setVcPhone] = useState("");
  const [vcEmail, setVcEmail] = useState("");
  const [vcCompany, setVcCompany] = useState("");
  const [vcTitle, setVcTitle] = useState("");
  const [vcWebsite, setVcWebsite] = useState("");

  // ── Email mode ───────────────────────────────────────────────────────────
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // ── SMS mode ─────────────────────────────────────────────────────────────
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMsg, setSmsMsg] = useState("");

  // ── Appearance ───────────────────────────────────────────────────────────
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [dotStyle, setDotStyle] = useState<DotType>("square");
  const [cornerStyle, setCornerStyle] = useState<CornerSquareType>("square");

  // ── Logo ─────────────────────────────────────────────────────────────────
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pasteStatus, setPasteStatus] = useState("");

  // ── Export ───────────────────────────────────────────────────────────────
  const [exportFormat, setExportFormat] = useState<FileExtension>("png");
  const [exportSize, setExportSize] = useState(1024);

  // ── UI Feedback ──────────────────────────────────────────────────────────
  const [copyStatus, setCopyStatus] = useState("");
  const [saveFlash, setSaveFlash] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);

  // ── History ──────────────────────────────────────────────────────────────
  const { history, addEntry, clearHistory } = useLocalHistory();
  const [showHistory, setShowHistory] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  // ─── Compute encoded data string ──────────────────────────────────────────
  const qrData = useMemo(() => {
    switch (mode) {
      case "url":
        return url || " ";
      case "wifi":
        return encodeWifi({
          ssid: wifiSsid,
          password: wifiPass,
          encryption: wifiEnc,
        });
      case "vcard":
        return encodeVCard({
          firstName: vcFirst,
          lastName: vcLast,
          phone: vcPhone,
          email: vcEmail,
          company: vcCompany,
          title: vcTitle,
          website: vcWebsite,
        });
      case "email":
        return encodeEmail({ to: emailTo, subject: emailSubject, body: emailBody });
      case "sms":
        return encodeSms({ phone: smsPhone, message: smsMsg });
    }
  }, [
    mode,
    url,
    wifiSsid, wifiPass, wifiEnc,
    vcFirst, vcLast, vcPhone, vcEmail, vcCompany, vcTitle, vcWebsite,
    emailTo, emailSubject, emailBody,
    smsPhone, smsMsg,
  ]);

  // ─── Build label for history ───────────────────────────────────────────────
  const qrLabel = useMemo(() => {
    switch (mode) {
      case "url": return url || "URL";
      case "wifi": return wifiSsid || "Wi-Fi Network";
      case "vcard": return `${vcFirst} ${vcLast}`.trim() || "vCard";
      case "email": return emailTo || "Email";
      case "sms": return smsPhone || "SMS";
    }
  }, [mode, url, wifiSsid, vcFirst, vcLast, emailTo, smsPhone]);

  // ─── Instantiate qr-code-styling once ────────────────────────────────────
  useEffect(() => {
    // Avoid double-mount in React Strict Mode
    if (qrInstanceRef.current) return;
    qrInstanceRef.current = new QRCodeStyling({
      width: QR_SIZE,
      height: QR_SIZE,
      type: "canvas",
      data: qrData,
      dotsOptions: { type: dotStyle, color: fgColor },
      cornersSquareOptions: { type: cornerStyle, color: fgColor },
      backgroundOptions: { color: bgColor },
      imageOptions: { crossOrigin: "anonymous", margin: 6 },
      qrOptions: { errorCorrectionLevel: "Q" },
    });
    if (qrContainerRef.current) {
      qrInstanceRef.current.append(qrContainerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Update QR whenever options change ───────────────────────────────────
  useEffect(() => {
    if (!qrInstanceRef.current) return;
    qrInstanceRef.current.update({
      data: qrData,
      dotsOptions: { type: dotStyle, color: fgColor },
      cornersSquareOptions: { type: cornerStyle, color: fgColor },
      backgroundOptions: { color: bgColor },
      image: logoSrc ?? undefined,
    });
  }, [qrData, dotStyle, cornerStyle, fgColor, bgColor, logoSrc]);

  // ─── Logo helpers ─────────────────────────────────────────────────────────
  const applyImageFile = useCallback((file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

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

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyImageFile(file);
  };

  const handleRemoveLogo = () => {
    setLogoSrc(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Restore from history ─────────────────────────────────────────────────
  const restoreEntry = useCallback((entry: HistoryEntry) => {
    setMode(entry.mode);
    const d = entry.rawData;
    switch (entry.mode) {
      case "url": setUrl(d.url ?? ""); break;
      case "wifi":
        setWifiSsid(d.ssid ?? "");
        setWifiPass(d.pass ?? "");
        setWifiEnc((d.enc as WifiEncryptionType) ?? "WPA");
        break;
      case "vcard":
        setVcFirst(d.first ?? ""); setVcLast(d.last ?? "");
        setVcPhone(d.phone ?? ""); setVcEmail(d.email ?? "");
        setVcCompany(d.company ?? ""); setVcTitle(d.title ?? "");
        setVcWebsite(d.website ?? "");
        break;
      case "email":
        setEmailTo(d.to ?? ""); setEmailSubject(d.subject ?? "");
        setEmailBody(d.body ?? "");
        break;
      case "sms":
        setSmsPhone(d.phone ?? ""); setSmsMsg(d.message ?? "");
        break;
    }
    setShowHistory(false);
  }, []);

  // ─── Save to history ──────────────────────────────────────────────────────
  const handleSaveToHistory = useCallback(() => {
    let rawData: Record<string, string> = {};
    switch (mode) {
      case "url": rawData = { url }; break;
      case "wifi": rawData = { ssid: wifiSsid, pass: wifiPass, enc: wifiEnc }; break;
      case "vcard": rawData = {
        first: vcFirst, last: vcLast, phone: vcPhone, email: vcEmail,
        company: vcCompany, title: vcTitle, website: vcWebsite,
      }; break;
      case "email": rawData = { to: emailTo, subject: emailSubject, body: emailBody }; break;
      case "sms": rawData = { phone: smsPhone, message: smsMsg }; break;
    }
    addEntry({ mode, label: qrLabel, data: qrData, rawData });
  }, [mode, qrLabel, qrData, url, wifiSsid, wifiPass, wifiEnc, vcFirst, vcLast,
    vcPhone, vcEmail, vcCompany, vcTitle, vcWebsite, emailTo, emailSubject,
    emailBody, smsPhone, smsMsg, addEntry]);

  // ─── Download ─────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!qrInstanceRef.current) return;
    // Recreate with requested export size
    const exporter = new QRCodeStyling({
      width: exportSize,
      height: exportSize,
      type: exportFormat === "svg" ? "svg" : "canvas",
      data: qrData,
      dotsOptions: { type: dotStyle, color: fgColor },
      cornersSquareOptions: { type: cornerStyle, color: fgColor },
      backgroundOptions: { color: bgColor },
      image: logoSrc ?? undefined,
      imageOptions: { crossOrigin: "anonymous", margin: Math.round(exportSize * 0.02) },
      qrOptions: { errorCorrectionLevel: "Q" },
    });
    await exporter.download({ extension: exportFormat, name: `qrcode-${Date.now()}` });
    handleSaveToHistory();
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 700);
  };

  // ─── Copy ─────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    const container = qrContainerRef.current;
    if (!container) return;
    const canvas = container.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) { setCopyStatus("Failed"); return; }
    canvas.toBlob(async (blob) => {
      if (!blob) { setCopyStatus("Failed"); return; }
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopyStatus("Copied!");
        setCopyFlash(true);
        setTimeout(() => { setCopyStatus(""); setCopyFlash(false); }, 2000);
      } catch {
        setCopyStatus("Error");
        setTimeout(() => setCopyStatus(""), 2000);
      }
    }, "image/png");
  };

  // ─── Shared input class ───────────────────────────────────────────────────
  const inputCls =
    "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg " +
    "focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none " +
    "transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 text-sm";

  const labelCls = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";

  // ─── Mode Form Renderer ───────────────────────────────────────────────────
  const renderModeForm = () => {
    switch (mode) {
      case "url":
        return (
          <div>
            <label className={labelCls}>Destination URL</label>
            <input
              id="qr-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={inputCls}
            />
          </div>
        );

      case "wifi":
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>Network Name (SSID)</label>
              <input id="qr-wifi-ssid" type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="My Network" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input id="qr-wifi-pass" type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="••••••••" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Encryption</label>
              <select id="qr-wifi-enc" value={wifiEnc} onChange={(e) => setWifiEnc(e.target.value as WifiEncryptionType)} className={inputCls}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
          </div>
        );

      case "vcard":
        return (
          <div className="grid grid-cols-2 gap-2">
            {([
              ["First Name", vcFirst, setVcFirst, "qr-vc-first", "text", "Jane"],
              ["Last Name", vcLast, setVcLast, "qr-vc-last", "text", "Doe"],
              ["Phone", vcPhone, setVcPhone, "qr-vc-phone", "tel", "+1 555 000 0000"],
              ["Email", vcEmail, setVcEmail, "qr-vc-email", "email", "jane@example.com"],
              ["Company", vcCompany, setVcCompany, "qr-vc-company", "text", "Acme Inc."],
              ["Job Title", vcTitle, setVcTitle, "qr-vc-title", "text", "Designer"],
            ] as [string, string, (v: string) => void, string, string, string][]).map(([label, val, setter, id, type, ph]) => (
              <div key={id}>
                <label className={labelCls}>{label}</label>
                <input id={id} type={type} value={val} onChange={(e) => setter(e.target.value)} placeholder={ph} className={inputCls} />
              </div>
            ))}
            <div className="col-span-2">
              <label className={labelCls}>Website</label>
              <input id="qr-vc-website" type="url" value={vcWebsite} onChange={(e) => setVcWebsite(e.target.value)} placeholder="https://example.com" className={inputCls} />
            </div>
          </div>
        );

      case "email":
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>To</label>
              <input id="qr-email-to" type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="recipient@example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Subject</label>
              <input id="qr-email-subject" type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Hello!" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Body</label>
              <textarea id="qr-email-body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Message…" rows={3} className={inputCls + " resize-none"} />
            </div>
          </div>
        );

      case "sms":
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input id="qr-sms-phone" type="tel" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Message</label>
              <textarea id="qr-sms-msg" value={smsMsg} onChange={(e) => setSmsMsg(e.target.value)} placeholder="Hi there!" rows={3} className={inputCls + " resize-none"} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mx-auto">
      {/* ── Left Panel: Controls ── */}
      <div className="flex flex-col gap-5 p-6 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-900 flex-1 min-w-0 transition-colors duration-300">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">QR Generator</h2>
          <button
            id="history-toggle-btn"
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
            </svg>
            History {history.length > 0 && <span className="bg-indigo-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{history.length}</span>}
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1" role="tablist">
          {(Object.keys(MODE_LABELS) as QRMode[]).map((m) => (
            <button
              key={m}
              role="tab"
              id={`tab-${m}`}
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                mode === m
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Dynamic form */}
        <div key={mode}>{renderModeForm()}</div>

        {/* Divider */}
        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Appearance</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Colors */}
            <div>
              <label className={labelCls} htmlFor="qr-fg-color">Foreground</label>
              <div className="flex items-center gap-2">
                <input
                  id="qr-fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{fgColor.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="qr-bg-color">Background</label>
              <div className="flex items-center gap-2">
                <input
                  id="qr-bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{bgColor.toUpperCase()}</span>
              </div>
            </div>
            {/* Dot Style */}
            <div>
              <label className={labelCls} htmlFor="qr-dot-style">Dot Style</label>
              <select id="qr-dot-style" value={dotStyle} onChange={(e) => setDotStyle(e.target.value as DotType)} className={inputCls}>
                {DOT_STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {/* Corner Style */}
            <div>
              <label className={labelCls} htmlFor="qr-corner-style">Corner Style</label>
              <select id="qr-corner-style" value={cornerStyle} onChange={(e) => setCornerStyle(e.target.value as CornerSquareType)} className={inputCls}>
                {CORNER_STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className={labelCls}>Center Logo <span className="normal-case font-normal">(optional)</span></label>
          {logoSrc ? (
            <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="Logo preview" className="w-10 h-10 rounded-md object-contain border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">{logoFile?.name ?? "Uploaded logo"}</span>
              <button onClick={handleRemoveLogo} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition">Remove</button>
            </div>
          ) : (
            <>
              <button
                id="logo-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition cursor-pointer"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload image (PNG, SVG, JPG…)
              </button>
              <p className="mt-1.5 text-center text-xs text-gray-400 dark:text-gray-500">
                {pasteStatus
                  ? <span className="text-green-600 dark:text-green-400 font-medium">{pasteStatus}</span>
                  : <>or <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-300 font-mono">Ctrl+V</kbd> to paste</>}
              </p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
        </div>

        {/* Divider */}
        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Export Options */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Export Options</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="qr-export-format">Format</label>
              <select id="qr-export-format" value={exportFormat} onChange={(e) => setExportFormat(e.target.value as FileExtension)} className={inputCls}>
                {EXPORT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="qr-export-size">Size (px)</label>
              <input
                id="qr-export-size"
                type="number"
                min={128}
                max={4096}
                step={64}
                value={exportSize}
                onChange={(e) => setExportSize(Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Preview + Actions ── */}
      <div className="flex flex-col gap-4 w-full lg:w-[320px] shrink-0">

        {/* QR Preview */}
        <div
          className={`p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center gap-4 transition-all duration-300 ${saveFlash || copyFlash ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-950 scale-[1.01]" : ""}`}
        >
          <div
            id="qr-preview-container"
            ref={qrContainerRef}
            className={`rounded-xl overflow-hidden transition-transform duration-300 ${saveFlash || copyFlash ? "animate-qr-pop" : ""}`}
            style={{ width: QR_SIZE, height: QR_SIZE }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            id="copy-qr-btn"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-800 dark:text-gray-100 font-medium rounded-xl transition active:scale-95 border border-gray-200 dark:border-gray-700 text-sm"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copyStatus || "Copy"}
          </button>
          <button
            id="download-qr-btn"
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition active:scale-95 text-sm shadow-sm"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Save {exportFormat.toUpperCase()}
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent QR Codes</h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 transition">Clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No history yet. Generate and save a QR code to see it here.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {history.map((entry) => (
                  <li key={entry.id}>
                    <button
                      onClick={() => restoreEntry(entry)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shrink-0">
                        {entry.mode}
                      </span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{entry.label}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-600 shrink-0">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Micro-animation keyframes */}
      <style>{`
        @keyframes qr-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.04); }
          70%  { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        .animate-qr-pop { animation: qr-pop 0.5s ease; }
      `}</style>
    </div>
  );
}
