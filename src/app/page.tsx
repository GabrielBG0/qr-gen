"use client";

import QRCodeGenerator from "@/app/components/QRCodeGenerator";
import LinkShortener from "@/app/components/LinkShortener";
import { useTheme } from "@/app/components/ThemeProvider";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
      >
        {theme === "dark" ? (
          // Sun icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-400"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-2">
          QR Gen
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Personal utilities for links and codes.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl">
        {/* Tool 1 */}
        <QRCodeGenerator />

        {/* Tool 2 */}
        <LinkShortener />
      </div>
      <div className="mt-8">
        <p className="text-gray-600 dark:text-gray-400">
          Generate and manage your QR codes easily.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Shorten your links with ease and efficiency.
        </p>
      </div>
    </main>
  );
}

