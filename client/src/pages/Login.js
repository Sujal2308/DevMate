import React, { useState } from "react";
// Font loaded via <link> in index.html or inline @import below
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate("/feed");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lobster&family=Space+Grotesk:wght@500;700&display=swap');

        *,*::before,*::after { box-sizing: border-box; }

        .lp-root {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #080810;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          position: relative;
        }

        /* ── ambient blobs ── */
        .lp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          z-index: 0;
        }
        .lp-blob-1 {
          width: 520px; height: 520px;
          top: -160px; left: -120px;
          background: rgba(88,101,242,0.12);
        }
        .lp-blob-2 {
          width: 420px; height: 420px;
          bottom: -120px; right: -100px;
          background: rgba(87,242,135,0.07);
        }

        /* ══════════════════════════
           LEFT  –  illustration
        ══════════════════════════ */
        .lp-left {
          display: none;           /* mobile: hidden */
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


        .lp-illustration {
          width: 95%;
          max-width: 460px;
          height: auto;
          position: relative;
          z-index: 2;
          filter: none;
        }

        .lp-tagline {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.38);
          text-align: center;
          letter-spacing: 0.04em;
          line-height: 1.7;
          position: relative;
          z-index: 2;
          padding: 0 1rem;
        }

        /* ══════════════════════════
           RIGHT  –  form
        /* ── Right  –  form ── */
        .lp-right {
          width: 100%;       /* full width on mobile */
          position: relative;
          z-index: 1;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 1.5rem 3rem;
          overflow-y: auto;
        }

        /* top bar elements moved */
        .lp-left-brand {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
        }

        .lp-back {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.6);
          text-decoration: none;
          transition: all 0.2s;
          z-index: 10;
        }
        .lp-back:hover { 
          background: rgba(0, 0, 0, 0.1);
          color: #000;
          transform: translateX(-2px);
        }

        /* brand in panels */
        .lp-topbrand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          z-index: 10;
        }
        .lp-puzzle-icon {
          width: 32px;
          height: 32px;
          object-fit: contain;
          filter: none;
        }
        .lp-brand-text {
          font-family: 'Lobster', cursive;
          font-size: 2.2rem;
          color: #ffffff;  /* white for black bg panel */
          letter-spacing: normal;
        }

        /* form card */
        .lp-card {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .lp-heading { display: flex; flex-direction: column; gap: 0.35rem; }
        .lp-title {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        .lp-sub {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(0,0,0,0.5);
        }
        .lp-sub-accent { color: #2563eb; font-weight: 600; }

        /* error */
        .lp-error {
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
        .lp-error svg { flex-shrink: 0; margin-top: 1px; }

        /* form fields */
        .lp-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .lp-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .lp-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(0,0,0,0.6);
          letter-spacing: 0.03em;
        }
        .lp-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lp-forgot {
          font-size: 0.75rem;
          color: #5865f2;
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-forgot:hover { color: #7289da; }

        .lp-input-wrap { position: relative; }
        .lp-input {
          width: 100%;
          padding: 0.7rem 1rem;
          background: #000000;
          border: 1px solid #333333;
          border-radius: 0;
          color: #ffffff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .lp-input::placeholder { color: rgba(255,255,255,0.3); }
        .lp-input:focus {
          border-color: #2563eb;
          box-shadow: none;
        }

        .lp-eye {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .lp-eye:hover { color: rgba(255,255,255,0.85); }

        .lp-submit {
          width: 100%;
          padding: 0.78rem;
          background: #2563eb;
          border: none;
          border-radius: 0;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: none;
          margin-top: 0.2rem;
        }
        .lp-submit:hover:not(:disabled) {
          background-color: #1d4ed8;
          box-shadow: none;
        }
        .lp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* mobile logo – hidden on desktop, shown on mobile */
        .lp-mobile-logo {
          display: none;
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
        }
        .lp-mobile-logo img {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }

        /* register line */
        .lp-reg {
          font-size: 0.82rem;
          color: rgba(0,0,0,0.45);
          text-align: center;
          margin: 0;
        }
        .lp-reg-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-reg-link:hover { color: #1d4ed8; }

        /* ── Desktop (>=768px) ── */
        @media (min-width: 768px) {
          .lp-left  { display: flex; flex: 1; }
          .lp-right { flex: 1; padding: 5rem 3.5rem 3rem; }
          .lp-topbar { padding: 1.1rem 2rem; }
        }

        /* ── Mobile (<768px) ── */
        @media (max-width: 767px) {
          .lp-back { left: 0.75rem; top: 1rem; }
          .lp-mobile-logo { display: flex; }
        }
      `}</style>

      <div className="lp-root">
        {/* blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />

        {/* ── Left ── */}
        <div className="lp-left">
          <div className="lp-topbrand lp-left-brand">
            <img src="/icons/puzzle.png" alt="DevMate logo" className="lp-puzzle-icon" />
            <span className="lp-brand-text">DevMate</span>
          </div>
          <img
            src="/Mobile login-cuate.svg"
            alt="Mobile login illustration"
            className="lp-illustration"
          />
          <p className="lp-tagline">Connect. Collaborate. Build together.</p>
        </div>

        {/* ── Right ── */}
        <div className="lp-right">
          <Link to="/" className="lp-back" aria-label="Back to home">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Mobile-only puzzle logo */}
          <div className="lp-mobile-logo">
            <img src="/icons/puzzle.png" alt="DevMate" />
          </div>

          <div className="lp-card">
            {/* heading */}
            <div className="lp-heading">
              <h1 className="lp-title">Welcome back</h1>
              <p className="lp-sub">
                Sign in to your{" "}
                <span className="lp-sub-accent">DevMate</span> account
              </p>
            </div>

            {/* error */}
            {error && (
              <div className="lp-error">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd" />
                </svg>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            {/* form */}
            <form onSubmit={handleSubmit} className="lp-form">
              {/* email */}
              <div className="lp-field">
                <label htmlFor="email" className="lp-label">Email</label>
                <input
                  id="email" name="email" type="email"
                  autoComplete="email" required
                  className="lp-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* password */}
              <div className="lp-field">
                <div className="lp-label-row">
                  <label htmlFor="password" className="lp-label">Password</label>
                  <a href="/forgot-password" className="lp-forgot">Forgot password?</a>
                </div>
                <div className="lp-input-wrap">
                  <input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password" required
                    className="lp-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button type="button" className="lp-eye" tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="lp-submit">
                {loading ? (
                  <>
                    <LoadingSpinner size="small" compact={true} />
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </form>

            <p className="lp-reg">
              Don't have an account?{" "}
              <Link to="/register" className="lp-reg-link">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
