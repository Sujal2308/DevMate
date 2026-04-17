import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setMessage("Password reset successful! You can now sign in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Reset failed. Try again or request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rs-root flex items-center justify-center p-6 bg-[#080810]">
        <div className="max-w-md w-full p-8 bg-black border border-[#333] text-white">
          <h2 className="text-2xl font-bold mb-4 font-mono uppercase tracking-tighter">Invalid Link</h2>
          <p className="text-gray-400 mb-6">Reset token is missing or invalid. Please request a new password reset link.</p>
          <Link to="/forgot-password" title="Go to Forgot Password" className="text-[#2563eb] font-bold hover:underline">
            Request new link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lobster&family=Space+Grotesk:wght@500;700;800&display=swap');

        *,*::before,*::after { box-sizing: border-box; }

        .rs-root {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #080810;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          position: relative;
        }

        /* ── blobs ── */
        .rs-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          z-index: 0;
        }
        .rs-blob-1 { width: 520px; height: 520px; top: -160px; left: -120px; background: rgba(88,101,242,0.12); }
        .rs-blob-2 { width: 420px; height: 420px; bottom: -120px; right: -100px; background: rgba(87,242,135,0.07); }

        /* ── Left panel ── */
        .rs-left {
          display: none;
          flex: 1;
          position: relative;
          z-index: 1;
          background: #000000;
          border-right: 1px solid rgba(255,255,255,0.08);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 3rem 2.5rem;
          overflow: hidden;
        }

        .rs-left-brand {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          z-index: 10;
        }
        .rs-puzzle { width: 32px; height: 32px; object-fit: contain; }
        .rs-brand-text {
          font-family: 'Lobster', cursive;
          font-size: 2.2rem;
          color: #ffffff;
        }

        .rs-illustration {
          width: 100%;
          max-width: 480px;
          height: auto;
          position: relative;
          z-index: 2;
        }
        .rs-tagline {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.38);
          text-align: center;
          letter-spacing: 0.04em;
          line-height: 1.7;
          position: relative;
          z-index: 2;
          padding: 0 1rem;
        }

        /* ── Right panel ── */
        .rs-right {
          width: 100%;
          position: relative;
          z-index: 1;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 1.5rem 2rem;
          overflow-y: auto;
        }

        /* back button */
        .rs-back {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0,0,0,0.05);
          color: rgba(0,0,0,0.6);
          text-decoration: none;
          transition: all 0.2s;
          z-index: 10;
        }
        .rs-back:hover { background: rgba(0,0,0,0.1); color: #000; transform: translateX(-2px); }

        /* form card */
        .rs-card {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .rs-heading { display: flex; flex-direction: column; gap: 0.3rem; }
        .rs-title {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        .rs-sub { margin: 0; font-size: 0.875rem; color: rgba(0,0,0,0.45); }
        .rs-sub-accent { color: #2563eb; font-weight: 600; }

        /* messages */
        .rs-message {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.22);
          padding: 0.65rem 0.8rem;
          color: #10b981;
          font-size: 0.82rem;
        }

        .rs-error {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.22);
          border-radius: 0;
          padding: 0.65rem 0.8rem;
          color: #f87171;
          font-size: 0.82rem;
        }
        .rs-error svg, .rs-message svg { flex-shrink: 0; margin-top: 1px; }

        /* form */
        .rs-form { display: flex; flex-direction: column; gap: 1.2rem; }
        .rs-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .rs-label { font-size: 0.8rem; font-weight: 600; color: rgba(0,0,0,0.6); letter-spacing: 0.03em; }
        
        .rs-input-wrap { position: relative; }
        .rs-input {
          width: 100%;
          padding: 0.7rem 1rem;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0;
          color: #111111;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .rs-input::placeholder { color: rgba(0, 0, 0, 0.4); }
        .rs-input:focus { border-color: #2563eb; box-shadow: none; }

        .rs-eye {
          position: absolute; right: 0.8rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(0, 0, 0, 0.35); display: flex; align-items: center; padding: 0;
          transition: color 0.2s;
        }
        .rs-eye:hover { color: rgba(0, 0, 0, 0.7); }

        .rs-submit {
          width: 100%; padding: 0.78rem;
          background: #2563eb; border: none; border-radius: 0;
          color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: none; margin-top: 0.2rem;
        }
        .rs-submit:hover:not(:disabled) { background-color: #1d4ed8; }
        .rs-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* mobile logo */
        .rs-mobile-logo {
          display: none;
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
        }
        .rs-mobile-logo img {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }

        /* ── Desktop ── */
        @media (min-width: 768px) {
          .rs-left { display: flex; flex: 1; }
          .rs-right { flex: 1; padding: 5rem 3.5rem 2rem; }
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .rs-back { left: 0.75rem; top: 1rem; }
          .rs-mobile-logo { display: flex; }
        }
      `}</style>

      <div className="rs-root">
        <div className="rs-blob rs-blob-1" />
        <div className="rs-blob rs-blob-2" />

        {/* ── Left panel ── */}
        <div className="rs-left">
          <div className="rs-left-brand">
            <img src="/icons/puzzle.png" alt="DevMate" className="rs-puzzle" width="32" height="32" fetchpriority="high" />
            <span className="rs-brand-text">DevMate</span>
          </div>
          <img
            src="/Reset password-cuate.svg"
            alt="Reset password illustration"
            className="rs-illustration"
            width="480"
            height="480"
            fetchpriority="high"
          />
          <p className="rs-tagline">Secure your account with a strong new password.</p>
        </div>

        {/* ── Right panel ── */}
        <div className="rs-right">
          <Link to="/login" className="rs-back" aria-label="Back to login">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Mobile logo */}
          <div className="rs-mobile-logo">
            <img src="/icons/puzzle.png" alt="DevMate" width="44" height="44" />
          </div>

          <div className="rs-card">
            <div className="rs-heading">
              <h1 className="rs-title">Reset password</h1>
              <p className="rs-sub">
                Enter a new password for your{" "}
                <span className="rs-sub-accent">DevMate</span> account
              </p>
            </div>

            {/* feedback messages */}
            {message && (
              <div className="rs-message">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <p style={{ margin: 0 }}>{message}</p>
              </div>
            )}
            {error && (
              <div className="rs-error">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rs-form">
              {/* password */}
              <div className="rs-field">
                <label htmlFor="password" className="rs-label">New Password</label>
                <div className="rs-input-wrap">
                  <input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    required minLength={6}
                    className="rs-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button type="button" className="rs-eye" tabIndex={-1}
                    onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* confirm password */}
              <div className="rs-field">
                <label htmlFor="confirm" className="rs-label">Confirm New Password</label>
                <div className="rs-input-wrap">
                  <input
                    id="confirm" name="confirm"
                    type={showConfirm ? "text" : "password"}
                    required minLength={6}
                    className="rs-input"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button type="button" className="rs-eye" tabIndex={-1}
                    onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="rs-submit">
                {loading ? (
                  <>
                    <LoadingSpinner size="small" compact={true} />
                    Resetting...
                  </>
                ) : "Update Password"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Wait, I remember it!{" "}
              <Link to="/login" className="text-[#2563eb] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
