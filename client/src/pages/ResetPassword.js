import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
      <div className="max-w-md mx-auto mt-20 p-6 bg-x-dark rounded-xl shadow-lg text-x-white">
        <h2 className="text-2xl font-bold mb-4">Invalid Link</h2>
        <p>Reset token is missing or invalid.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-x-dark rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-x-white">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-x-gray mb-1">
            New Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 rounded-lg border border-x-border bg-x-black text-x-white focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-x-gray mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm"
            className="w-full px-4 py-2 rounded-lg border border-x-border bg-x-black text-x-white focus:outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full py-2 font-semibold"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && <p className="text-green-400 mt-4">{message}</p>}
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default ResetPassword;
