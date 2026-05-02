import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {mode === "login" ? "Sign in" : "Create account"}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handle}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slo-green"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slo-green"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slo-green"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slo-green text-white py-2 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? "No account?" : "Already have one?"}{" "}
          <button
            onClick={() => onSwitchMode(mode === "login" ? "register" : "login")}
            className="text-slo-green font-medium hover:underline"
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
