import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "At least 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "At least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(formData.username, formData.email, formData.password);
      navigate("/feed");
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lobster&family=Space+Grotesk:wght@500;700;800&display=swap');

        *,*::before,*::after { box-sizing: border-box; }

        .rp-root {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #080810;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          position: relative;
        }

        /* ── blobs ── */
        .rp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          z-index: 0;
        }
        .rp-blob-1 { width: 520px; height: 520px; top: -160px; left: -120px; background: rgba(88,101,242,0.12); }
        .rp-blob-2 { width: 420px; height: 420px; bottom: -120px; right: -100px; background: rgba(87,242,135,0.07); }

        /* ── Left panel ── */
        .rp-left {
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

        .rp-left-brand {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          z-index: 10;
        }
        .rp-puzzle { width: 32px; height: 32px; object-fit: contain; }
        .rp-brand-text {
          font-family: 'Lobster', cursive;
          font-size: 2.2rem;
          color: #ffffff;
        }

        .rp-illustration {
          width: 110%;
          max-width: 520px;
          height: auto;
          position: relative;
          z-index: 2;
        }
        .rp-tagline {
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
        .rp-right {
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
        .rp-back {
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
        .rp-back:hover { background: rgba(0,0,0,0.1); color: #000; transform: translateX(-2px); }

        /* form card */
        .rp-card {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .rp-heading { display: flex; flex-direction: column; gap: 0.3rem; }
        .rp-title {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        .rp-sub { margin: 0; font-size: 0.875rem; color: rgba(0,0,0,0.45); }
        .rp-sub-accent { color: #2563eb; font-weight: 600; }

        /* general error */
        .rp-error {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 0;
          padding: 0.6rem 0.8rem;
          color: #dc2626;
          font-size: 0.82rem;
        }

        /* form */
        .rp-form { display: flex; flex-direction: column; gap: 0.9rem; }
        .rp-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .rp-label { font-size: 0.8rem; font-weight: 600; color: rgba(0,0,0,0.55); letter-spacing: 0.03em; }
        .rp-input {
          width: 100%;
          padding: 0.68rem 1rem;
          background: #000000;
          border: 1px solid #333333;
          border-radius: 0;
          color: #ffffff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .rp-input::placeholder { color: rgba(255,255,255,0.28); }
        .rp-input:focus { border-color: #2563eb; box-shadow: none; }
        .rp-input.rp-input-err { border-color: #dc2626; }
        .rp-field-err { font-size: 0.75rem; color: #dc2626; margin: 0; }

        .rp-input-wrap { position: relative; }
        .rp-eye {
          position: absolute; right: 0.8rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35); display: flex; align-items: center; padding: 0;
          transition: color 0.2s;
        }
        .rp-eye:hover { color: rgba(255,255,255,0.8); }

        .rp-submit {
          width: 100%; padding: 0.78rem;
          background: #2563eb; border: none; border-radius: 0;
          color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: none; margin-top: 0.2rem;
        }
        .rp-submit:hover:not(:disabled) { background-color: #1d4ed8; }
        .rp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .rp-login-link { font-size: 0.82rem; color: rgba(0,0,0,0.4); text-align: center; margin: 0; }
        .rp-login-anchor { color: #2563eb; font-weight: 600; text-decoration: none; transition: color 0.2s; }
        .rp-login-anchor:hover { color: #1d4ed8; }

        /* mobile logo */
        .rp-mobile-logo {
          display: none;
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
        }
        .rp-mobile-logo img {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }

        /* ── Desktop ── */
        @media (min-width: 768px) {
          .rp-left { display: flex; flex: 1; }
          .rp-right { flex: 1; padding: 5rem 3.5rem 2rem; }
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .rp-back { left: 0.75rem; top: 1rem; }
          .rp-mobile-logo { display: flex; }
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-blob rp-blob-1" />
        <div className="rp-blob rp-blob-2" />

        {/* ── Left ── */}
        <div className="rp-left">
          <div className="rp-left-brand">
            <img src="/icons/puzzle.png" alt="DevMate" className="rp-puzzle" />
            <span className="rp-brand-text">DevMate</span>
          </div>
          <img
            src="/Tablet login-pana.svg"
            alt="Tablet login illustration"
            className="rp-illustration"
          />
          <p className="rp-tagline">Build your profile. Join the community.</p>
        </div>

        {/* ── Right ── */}
        <div className="rp-right">
          <Link to="/" className="rp-back" aria-label="Back to home">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Mobile-only puzzle logo */}
          <div className="rp-mobile-logo">
            <img src="/icons/puzzle.png" alt="DevMate" />
          </div>

          <div className="rp-card">
            <div className="rp-heading">
              <h1 className="rp-title">Create account</h1>
              <p className="rp-sub">
                Join thousands of devs on{" "}
                <span className="rp-sub-accent">DevMate</span>
              </p>
            </div>

            {errors.general && (
              <div className="rp-error">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{flexShrink:0,marginTop:1}}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{margin:0}}>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rp-form">
              {/* Username */}
              <div className="rp-field">
                <label htmlFor="username" className="rp-label">Username</label>
                <input id="username" name="username" type="text" required
                  className={`rp-input${errors.username ? " rp-input-err" : ""}`}
                  placeholder="Choose a username"
                  value={formData.username} onChange={handleChange} />
                {errors.username && <p className="rp-field-err">{errors.username}</p>}
              </div>

              {/* Email */}
              <div className="rp-field">
                <label htmlFor="email" className="rp-label">Email</label>
                <input id="email" name="email" type="email" required
                  className={`rp-input${errors.email ? " rp-input-err" : ""}`}
                  placeholder="you@example.com"
                  value={formData.email} onChange={handleChange} />
                {errors.email && <p className="rp-field-err">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="rp-field">
                <label htmlFor="password" className="rp-label">Password</label>
                <div className="rp-input-wrap">
                  <input id="password" name="password"
                    type={showPassword ? "text" : "password"} required
                    className={`rp-input${errors.password ? " rp-input-err" : ""}`}
                    placeholder="Min. 6 characters"
                    value={formData.password} onChange={handleChange}
                    style={{paddingRight:"2.5rem"}} />
                  <button type="button" className="rp-eye" tabIndex={-1}
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
                {errors.password && <p className="rp-field-err">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="rp-field">
                <label htmlFor="confirmPassword" className="rp-label">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required
                  className={`rp-input${errors.confirmPassword ? " rp-input-err" : ""}`}
                  placeholder="Repeat password"
                  value={formData.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <p className="rp-field-err">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading} className="rp-submit">
                {loading ? (
                  <>
                    <LoadingSpinner size="small" compact={true} />
                    Creating account...
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <p className="rp-login-link">
              Already have an account?{" "}
              <Link to="/login" className="rp-login-anchor">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
