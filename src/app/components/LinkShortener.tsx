"use client";

import React, { useActionState, useEffect, useState } from "react";
import {
  loginAction,
  shortenUrlAction,
  registerUserAction,
} from "@/app/actions";

interface FormState {
  success: boolean;
  message: string;
  role?: string; // Optional: only present after login
  shortUrl?: string; // Optional: only present after shortening
}

const initialState: FormState = { success: false, message: "" };

export default function LinkShortener() {
  // Server Actions
  const [loginState, loginDispatch, isLoginPending] = useActionState(
    loginAction,
    initialState
  );
  const [shortenState, shortenDispatch, isShortenPending] = useActionState(
    shortenUrlAction,
    initialState
  );
  const [registerState, registerDispatch, isRegisterPending] = useActionState(
    registerUserAction,
    initialState
  );

  // Local State
  const [shortUrl, setShortUrl] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // NEW: Track if we are showing the success message inside the modal
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  // 1. Effect: Check Login Success and Role
  useEffect(() => {
    if (loginState.success && loginState.role) {
      setUserRole(loginState.role);
    }
  }, [loginState]);

  // 2. Effect: Show Shortened URL
  useEffect(() => {
    if (shortenState?.success && shortenState.shortUrl) {
      setShortUrl(shortenState.shortUrl);
      setCopySuccess(false);
    }
  }, [shortenState]);

  // 3. UPDATED Effect: Handle Registration Success
  useEffect(() => {
    if (registerState.success) {
      setIsRegisterSuccess(true); // Switch to success view

      const timer = setTimeout(() => {
        setShowModal(false);
        setIsRegisterSuccess(false); // Reset view
      }, 2000); // Close after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [registerState]);

  // Copy Logic
  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 max-w-md w-full relative transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Link Shortener</h2>

      {!loginState.success ? (
        <form action={loginDispatch} className="w-full flex flex-col gap-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-lg border border-yellow-100 dark:border-yellow-800/40">
            🔒 This tool is private. Please log in.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter password"
            />
          </div>
          {loginState.message && (
            <p className="text-red-500 dark:text-red-400 text-sm">{loginState.message}</p>
          )}
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-lg transition active:scale-95 disabled:opacity-50"
          >
            {isLoginPending ? "Checking..." : "Login"}
          </button>
        </form>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <form action={shortenDispatch} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original URL
              </label>
              <input
                name="url"
                type="url"
                required
                placeholder="https://..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={isShortenPending}
              className="w-full py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-lg transition active:scale-95 disabled:opacity-50"
            >
              {isShortenPending ? "Shortening..." : "Shorten Link"}
            </button>
            {shortUrl && (
              <button
                type="button"
                onClick={handleCopy}
                className={`mt-2 w-full p-4 rounded-lg border transition-all duration-200 font-mono text-center break-all ${
                  copySuccess
                    ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 scale-105"
                    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-700"
                }`}
              >
                {copySuccess ? (
                  <span className="flex items-center justify-center gap-2 font-bold">
                    Copied!
                  </span>
                ) : (
                  shortUrl
                )}
              </button>
            )}
          </form>

          {userRole === "admin" && (
            <div className="w-full flex flex-col gap-3">
              <hr className="border-t border-gray-200 dark:border-gray-700" />
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">
                Admin Controls
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-lg transition active:scale-95"
              >
                ADD USER
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden transition-all">
          <div
            className={`
              bg-white dark:bg-gray-900 p-6 w-full sm:w-[90%] max-w-sm border-t sm:border border-gray-200 dark:border-gray-700 shadow-2xl sm:rounded-xl 
              animate-in slide-in-from-bottom sm:slide-in-from-center relative transition-all duration-300
              ${
                isRegisterSuccess
                  ? "flex flex-col items-center justify-center min-h-[300px]"
                  : ""
              }
            `}
          >
            {/* UPDATED MODAL CONTENT LOGIC */}
            {isRegisterSuccess ? (
              // SUCCESS VIEW
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Success!
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{registerState.message}</p>
              </div>
            ) : (
              // FORM VIEW (The original content)
              <>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  Register New User
                </h3>
                <form action={registerDispatch} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Username
                    </label>
                    <input
                      name="username"
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none"
                      >
                        <option value="user">User (Standard)</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {registerState?.message && !registerState.success && (
                    <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800/40">
                      {registerState.message}
                    </p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg transition active:scale-95 border border-transparent dark:border-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRegisterPending}
                      className="flex-1 py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-lg transition active:scale-95 disabled:opacity-50"
                    >
                      {isRegisterPending ? "Saving..." : "Create User"}
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
