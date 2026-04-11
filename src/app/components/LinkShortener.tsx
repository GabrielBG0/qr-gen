"use client";

import React, { useActionState, useEffect, useState } from "react";
import {
  loginAction,
  shortenUrlAction,
  registerUserAction,
  getUserLinksAction,
  deleteLinkAction,
} from "@/app/actions";

interface FormState {
  success: boolean;
  message: string;
  role?: string;
  shortUrl?: string;
  shortCode?: string;
}

const initialState: FormState = { success: false, message: "" };

// ── Shared input / label classes ───────────────────────────────────────────
const inputCls =
  "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none " +
  "focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 text-sm";

const labelCls =
  "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

const primaryBtnCls =
  "w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 " +
  "text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 text-sm";



export default function LinkShortener() {
  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, initialState);
  const [shortenState, shortenDispatch, isShortenPending] = useActionState(shortenUrlAction, initialState);
  const [registerState, registerDispatch, isRegisterPending] = useActionState(registerUserAction, initialState);

  const [shortUrl, setShortUrl] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [shortenedList, setShortenedList] = useState<{ short: string; original: string; clicks?: number; shortCode?: string }[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDelete = async (shortCode?: string) => {
    if (!shortCode) return;
    setOpenMenuId(null);
    const res = await deleteLinkAction(shortCode);
    if (res.success) {
      setShortenedList((prev) => prev.filter((link) => link.shortCode !== shortCode));
    } else {
      alert(res.message || "Failed to delete");
    }
  };

  useEffect(() => {
    if (loginState.success && loginState.role) {
      setUserRole(loginState.role);
      getUserLinksAction().then((res) => {
        if (res.success && res.links) {
          setShortenedList(res.links);
        }
      });
    }
  }, [loginState]);

  useEffect(() => {
    if (shortenState?.success && shortenState.shortUrl) {
      setShortUrl(shortenState.shortUrl);
      setShortenedList((prev) => {
        if (prev.some((link) => link.short === shortenState.shortUrl)) return prev;
        return [{ short: shortenState.shortUrl!, original: "Newly Shortened", clicks: 0, shortCode: shortenState.shortCode }, ...prev];
      });
      setCopySuccess(false);
    }
  }, [shortenState]);

  useEffect(() => {
    if (registerState.success) {
      setIsRegisterSuccess(true);
      const t = setTimeout(() => { setShowModal(false); setIsRegisterSuccess(false); }, 2000);
      return () => clearTimeout(t);
    }
  }, [registerState]);

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="w-full">
      {/* ── Two-column grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Login / Shorten form ──────────────────────────────────── */}
        <div className="flex flex-col gap-5 p-6 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">Link Shortener</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {loginState.success ? `Logged in as ${userRole}` : "Private tool — please authenticate"}
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* ── LOGIN FORM ── */}
          {!loginState.success ? (
            <form action={loginDispatch} className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm rounded-xl border border-amber-200 dark:border-amber-800/40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                This tool is private. Please log in to continue.
              </div>

              <div>
                <label className={labelCls} htmlFor="ls-username">Username</label>
                <input id="ls-username" name="username" type="text" required placeholder="Enter username" className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="ls-password">Password</label>
                <input id="ls-password" name="password" type="password" required placeholder="••••••••" className={inputCls} />
              </div>

              {loginState.message && (
                <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-100 dark:border-red-800/40">
                  {loginState.message}
                </p>
              )}

              <button type="submit" disabled={isLoginPending} className={primaryBtnCls}>
                {isLoginPending ? "Checking…" : "Login"}
              </button>
            </form>

          ) : (
            /* ── SHORTEN FORM ── */
            <div className="flex flex-col gap-5">
              <form action={shortenDispatch} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls} htmlFor="ls-url">Original URL</label>
                  <input id="ls-url" name="url" type="url" required placeholder="https://very-long-url.com/path?query=value" className={inputCls} />
                </div>
                <button type="submit" disabled={isShortenPending} className={primaryBtnCls}>
                  {isShortenPending ? "Shortening…" : "Shorten Link"}
                </button>

                {shortenState.message && !shortenState.success && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{shortenState.message}</p>
                )}
              </form>

              {/* Latest short URL result */}
              {shortUrl && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 font-mono text-sm text-center break-all ${
                    copySuccess
                      ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 scale-[1.02]"
                      : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                  }`}
                >
                  {copySuccess
                    ? <span className="font-semibold not-italic">✓ Copied to clipboard!</span>
                    : shortUrl}
                </button>
              )}

              {/* Admin panel */}
              {userRole === "admin" && (
                <div className="flex flex-col gap-3">
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Admin Controls</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-2.5 bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300 text-white dark:text-gray-900 font-semibold rounded-xl transition active:scale-95 text-sm"
                  >
                    Add User
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Info / History panel ─────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {loginState.success && (
            <>
              {/* Stats strip */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Links Created", value: shortenedList.length.toString() },
                  { label: "Account", value: userRole || "user" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">{value}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent links */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Your Recent Links
                </h3>

                <ul className="flex flex-col gap-2">
                  {shortenedList.length === 0 ? (
                    <li className="text-sm text-gray-400 dark:text-gray-600 text-center py-6">
                      No links yet — shorten something!
                    </li>
                  ) : (
                    shortenedList.map((item, i) => (
                      <li
                        key={i}
                        className="relative flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-mono truncate">{item.short}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.original}</p>
                        </div>
                        {"clicks" in item && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 mr-2">{(item as { clicks: number }).clicks.toLocaleString()} clicks</span>
                        )}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === item.shortCode ? null : item.shortCode || null)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                          {openMenuId === item.shortCode && item.shortCode && (
                            <div className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-10 overflow-hidden flex flex-col pointer-events-auto">
                              <button
                                type="button"
                                onClick={() => handleDelete(item.shortCode)}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}

          {/* How it works — shown only when not logged in */}
          {!loginState.success && (
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 shadow-sm">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">How it works</h3>
              <ol className="flex flex-col gap-2">
                {[
                  "Log in with your private credentials",
                  "Paste any long URL into the input field",
                  "Get a short, shareable link instantly",
                  "Track clicks from the dashboard",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-indigo-700 dark:text-indigo-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* ── Add-User Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className={`bg-white dark:bg-gray-900 p-6 w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl relative transition-all duration-300 ${isRegisterSuccess ? "flex flex-col items-center justify-center min-h-[260px]" : ""}`}>
            {isRegisterSuccess ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Success!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{registerState.message}</p>
              </div>
            ) : (
              <>
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5">Register New User</h3>
                <form action={registerDispatch} className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls} htmlFor="reg-username">New Username</label>
                    <input id="reg-username" name="username" type="text" required placeholder="Enter username" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-password">New Password</label>
                    <input id="reg-password" name="password" type="password" required placeholder="••••••••" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-role">Role</label>
                    <select id="reg-role" name="role" className={inputCls}>
                      <option value="user">User (Standard)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {registerState?.message && !registerState.success && (
                    <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-100 dark:border-red-800/40">
                      {registerState.message}
                    </p>
                  )}
                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition active:scale-95 border border-transparent dark:border-gray-700 text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={isRegisterPending}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition active:scale-95 disabled:opacity-50 text-sm">
                      {isRegisterPending ? "Saving…" : "Create User"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
