import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setMessage(
        "If an account with that email exists, a reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lobster&family=Space+Grotesk:wght@500;700;800&display=swap');

        *,*::before,*::after { box-sizing: border-box; }

        .fp-root {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #080810;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          position: relative;
        }

        /* ── blobs ── */
        .fp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          z-index: 0;
        }
        .fp-blob-1 { width: 520px; height: 520px; top: -160px; left: -120px; background: rgba(88,101,242,0.12); }
        .fp-blob-2 { width: 420px; height: 420px; bottom: -120px; right: -100px; background: rgba(87,242,135,0.07); }

        /* ── Left panel ── */
        .fp-left {
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

        .fp-left-brand {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          z-index: 10;
        }
        .fp-puzzle { width: 32px; height: 32px; object-fit: contain; }
        .fp-brand-text {
          font-family: 'Lobster', cursive;
          font-size: 2.2rem;
          color: #ffffff;
        }

        .fp-illustration {
          width: 100%;
          max-width: 480px;
          height: auto;
          position: relative;
          z-index: 2;
        }
        .fp-tagline {
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
        .fp-right {
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
        .fp-back {
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
        .fp-back:hover { background: rgba(0,0,0,0.1); color: #000; transform: translateX(-2px); }

        /* form card */
        .fp-card {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .fp-heading { display: flex; flex-direction: column; gap: 0.3rem; }
        .fp-title {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        .fp-sub { margin: 0; font-size: 0.875rem; color: rgba(0,0,0,0.45); }
        .fp-sub-accent { color: #2563eb; font-weight: 600; }

        /* messages */
        .fp-message {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.22);
          padding: 0.65rem 0.8rem;
          color: #10b981;
          font-size: 0.82rem;
        }

        .fp-error {
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
        .fp-error svg, .fp-message svg { flex-shrink: 0; margin-top: 1px; }

        /* form */
        .fp-form { display: flex; flex-direction: column; gap: 1.2rem; }
        .fp-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .fp-label { font-size: 0.8rem; font-weight: 600; color: rgba(0,0,0,0.6); letter-spacing: 0.03em; }
        
        .fp-input {
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
        .fp-input::placeholder { color: rgba(0, 0, 0, 0.4); }
        .fp-input:focus { border-color: #2563eb; box-shadow: none; }

        .fp-submit {
          width: 100%; padding: 0.78rem;
          background: #2563eb; border: none; border-radius: 0;
          color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: none; margin-top: 0.2rem;
        }
        .fp-submit:hover:not(:disabled) { background-color: #1d4ed8; }
        .fp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* mobile logo */
        .fp-mobile-logo {
          display: none;
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
        }
        .fp-mobile-logo img {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }

        /* ── Desktop ── */
        @media (min-width: 768px) {
          .fp-left { display: flex; flex: 1; }
          .fp-right { flex: 1; padding: 5rem 3.5rem 2rem; }
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .fp-back { left: 0.75rem; top: 1rem; }
          .fp-mobile-logo { display: flex; }
        }
      `}</style>

      <div className="fp-root">
        <div className="fp-blob fp-blob-1" />
        <div className="fp-blob fp-blob-2" />

        {/* ── Left panel ── */}
        <div className="fp-left">
          <div className="fp-left-brand">
            <img src="/icons/puzzle.png" alt="DevMate" className="fp-puzzle" width="32" height="32" fetchpriority="high" />
            <span className="fp-brand-text">DevMate</span>
          </div>
          <img
            src="/Reset password-cuate.svg"
            alt="Recovery illustration"
            className="fp-illustration"
            width="480"
            height="480"
            fetchpriority="high"
          />
          <p className="fp-tagline">No worries! We'll help you get back into your account in no time.</p>
        </div>

        {/* ── Right panel ── */}
        <div className="fp-right">
          <Link to="/login" className="fp-back" aria-label="Back to login">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Mobile logo */}
          <div className="fp-mobile-logo">
            <img src="/icons/puzzle.png" alt="DevMate" width="44" height="44" />
          </div>

          <div className="fp-card">
            <div className="fp-heading">
              <h1 className="fp-title">Lost your key?</h1>
              <p className="fp-sub">
                Enter your email to reset your{" "}
                <span className="fp-sub-accent">DevMate</span> password
              </p>
            </div>

            {/* feedback messages */}
            {message && (
              <div className="fp-message">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <p style={{ margin: 0 }}>{message}</p>
              </div>
            )}
            {error && (
              <div className="fp-error">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="fp-form">
              <div className="fp-field">
                <label htmlFor="email" className="fp-label">Email Address</label>
                <input
                  id="email" type="email" required
                  className="fp-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading} className="fp-submit">
                {loading ? (
                  <>
                    <LoadingSpinner size="small" compact={true} />
                    Sending link...
                  </>
                ) : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Go back to{" "}
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

export default ForgotPassword;
