"use client";

import { useState } from "react";
import QRCodeGenerator from "@/app/components/QRCodeGenerator";
import LinkShortener from "@/app/components/LinkShortener";
import { useTheme } from "@/app/components/ThemeProvider";

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  {
    id: "qr",
    label: "QR Generator",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="3" height="3" rx="0.5" />
        <rect x="19" y="14" width="2" height="2" rx="0.5" />
        <rect x="14" y="19" width="2" height="2" rx="0.5" />
        <rect x="18" y="19" width="3" height="2" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "links",
    label: "Link Shortener",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("qr");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950 transition-colors duration-300">

      {/* ── Top chrome bar ─────────────────────────────────────────────────── */}
      <header className="flex items-end gap-0 px-4 pt-4 bg-gray-200 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 select-none">

        {/* App wordmark — left side */}
        <div className="flex items-center gap-2 mr-4 mb-3 shrink-0">
          <img src="/star.svg" alt="QR Gen Logo" className="w-7 h-7" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">QR Gen</span>
        </div>

        {/* Browser-style tabs */}
        <nav className="flex items-end gap-0.5 flex-1" role="tablist" aria-label="Tools">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "group relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 cursor-pointer min-w-[140px] max-w-[220px]",
                  isActive
                    ? "bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-[0_-1px_0_0_inset] shadow-transparent border border-b-0 border-gray-300 dark:border-gray-700 z-10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : ""}>{tab.icon}</span>
                <span className="truncate">{tab.label}</span>

                {/* Active tab bottom fill — hides the border-bottom */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gray-50 dark:bg-gray-950"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle — far right, vertically centered */}
        <div className="ml-auto mb-2 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Page surface (content area) ────────────────────────────────────── */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full px-4 py-10">

          {/* Tab panels — keep both mounted to preserve state, show/hide via CSS */}
          <div
            id="panel-qr"
            role="tabpanel"
            aria-labelledby="tab-qr"
            className={activeTab === "qr" ? "block" : "hidden"}
          >
            <QRCodeGenerator />
          </div>

          <div
            id="panel-links"
            role="tabpanel"
            aria-labelledby="tab-links"
            className={activeTab === "links" ? "block" : "hidden"}
          >
            <LinkShortener />
          </div>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        Generate QR codes and shorten links — all in one place.
      </footer>
    </div>
  );
}
