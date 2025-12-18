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
    <div className="flex flex-col items-center gap-6 p-6 border border-gray-200 rounded-xl shadow-sm bg-white max-w-md w-full relative">
      <h2 className="text-2xl font-bold text-gray-800">Link Shortener</h2>

      {!loginState.success ? (
        <form action={loginDispatch} className="w-full flex flex-col gap-4">
          <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
            🔒 This tool is private. Please log in.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              placeholder="Enter password"
            />
          </div>
          {loginState.message && (
            <p className="text-red-500 text-sm">{loginState.message}</p>
          )}
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition active:scale-95 disabled:opacity-50"
          >
            {isLoginPending ? "Checking..." : "Login"}
          </button>
        </form>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <form action={shortenDispatch} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original URL
              </label>
              <input
                name="url"
                type="url"
                required
                placeholder="https://..."
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={isShortenPending}
              className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition active:scale-95 disabled:opacity-50"
            >
              {isShortenPending ? "Shortening..." : "Shorten Link"}
            </button>
            {shortUrl && (
              <button
                type="button"
                onClick={handleCopy}
                className={`mt-2 w-full p-4 rounded-lg border transition-all duration-200 font-mono text-center break-all ${
                  copySuccess
                    ? "bg-green-100 border-green-300 text-green-800 scale-105"
                    : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
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
              <hr className="border-t border-gray-200" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                Admin Controls
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition active:scale-95"
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
              bg-white p-6 w-full sm:w-[90%] max-w-sm border-t sm:border border-gray-200 shadow-2xl sm:rounded-xl 
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
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Success!
                </h3>
                <p className="text-gray-500">{registerState.message}</p>
              </div>
            ) : (
              // FORM VIEW (The original content)
              <>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition"
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
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Register New User
                </h3>
                <form action={registerDispatch} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Username
                    </label>
                    <input
                      name="username"
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white appearance-none"
                      >
                        <option value="user">User (Standard)</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
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
                    <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">
                      {registerState.message}
                    </p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRegisterPending}
                      className="flex-1 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition active:scale-95 disabled:opacity-50"
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
