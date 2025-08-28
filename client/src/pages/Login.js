import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
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
  <div className="min-h-screen bg-gradient-to-br from-x-black via-x-dark to-x-black flex items-center sm:items-center justify-center py-8 sm:py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-x-blue/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-x-green/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Arrow Back Button (top left) */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/"
            className="bg-x-dark/80 hover:bg-x-dark/90 border border-x-border/30 rounded-full p-2 shadow transition-colors duration-200 flex items-center justify-center"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-x-dark/60 backdrop-blur-md border border-x-border/30 rounded-xl shadow-lg shadow-x-black/30 p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-x-blue rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">D</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-x-white mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-x-gray">
              Sign in to continue to{" "}
              <span className="text-x-blue font-semibold">DevMate</span>
            </p>
            <div className="mt-3 flex items-center justify-center space-x-2">
              <span className="text-x-gray text-sm">New here?</span>
              <Link
                to="/register"
                className="font-medium transition-colors animate-gradient-text"
                style={{
                  background:
                    "linear-gradient(90deg, #A259FF, #C0C0C0, #A259FF, #F8F8F8)",
                  backgroundSize: "200% 200%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientText 2s linear infinite",
                }}
              >
                Create account
              </Link>
              <style>
                {`
                  @keyframes gradientText {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}
              </style>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/8 border border-red-500/15 text-red-400 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-x-white mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2.5 bg-x-black/50 border border-x-border/30 rounded-lg text-x-white placeholder-x-gray focus:outline-none focus:ring-2 focus:ring-x-blue/50 focus:border-x-blue transition-all duration-200"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-x-white mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2.5 bg-x-black/50 border border-x-border/30 rounded-lg text-x-white placeholder-x-gray focus:outline-none focus:ring-2 focus:ring-x-blue/50 focus:border-x-blue transition-all duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-9 text-xs focus:outline-none bg-black px-2 py-1 rounded text-white"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                <div className="text-right mt-1">
                  <a
                    href="/forgot-password"
                    className="text-xs text-x-blue hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-x-blue to-x-blue-hover text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-x-blue/25 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner
                    size="small"
                    className="mr-2"
                    compact={true}
                  />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
