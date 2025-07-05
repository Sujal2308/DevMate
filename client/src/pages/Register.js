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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
    <div className="min-h-screen bg-gradient-to-br from-x-black via-x-dark to-x-black flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-x-blue/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-x-green/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Main Card */}
        <div className="bg-x-dark/60 backdrop-blur-md border border-x-border/30 rounded-xl shadow-lg shadow-x-black/30 p-6 space-y-5">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-x-green to-x-blue rounded-xl flex items-center justify-center shadow-md shadow-x-green/20">
                <span className="text-white font-bold text-lg">D</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-x-white mb-1">
              Join DevMate
            </h1>
            <p className="text-sm text-x-gray">
              Connect with developers worldwide
            </p>
            <div className="mt-3 flex items-center justify-center space-x-2">
              <span className="text-x-gray text-sm">
                Already have an account?
              </span>
              <Link
                to="/login"
                className="text-x-blue hover:text-x-blue-hover font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Error Display */}
          {errors.general && (
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
                <p className="text-sm font-medium">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-x-white mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-x-black/50 border rounded-lg text-x-white placeholder-x-gray focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.username
                    ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                    : "border-x-border/30 focus:ring-x-blue/50 focus:border-x-blue"
                }`}
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
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
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-x-black/50 border rounded-lg text-x-white placeholder-x-gray focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.email
                    ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                    : "border-x-border/30 focus:ring-x-blue/50 focus:border-x-blue"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-x-white mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-x-black/50 border rounded-lg text-x-white placeholder-x-gray focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.password
                    ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                    : "border-x-border/30 focus:ring-x-blue/50 focus:border-x-blue"
                }`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-x-white mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-x-black/50 border rounded-lg text-x-white placeholder-x-gray focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.confirmPassword
                    ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                    : "border-x-border/30 focus:ring-x-blue/50 focus:border-x-blue"
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-x-green to-x-blue text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-x-green/25 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner
                    size="small"
                    className="mr-2"
                    compact={true}
                  />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
