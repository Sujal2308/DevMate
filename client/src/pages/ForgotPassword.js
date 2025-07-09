import React, { useState } from "react";
import axios from "axios";

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
      setMessage("If an account with that email exists, a reset link has been sent.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-x-dark rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-x-white">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-x-gray mb-1">
            Enter your email address
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-lg border border-x-border bg-x-black text-x-white focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full py-2 font-semibold"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && <p className="text-green-400 mt-4">{message}</p>}
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
