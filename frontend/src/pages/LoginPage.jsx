import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@greencart.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin?.();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-emerald-50 to-sky-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-xl font-semibold text-emerald-700">Manager Login</h2>
        <p className="mb-4 text-sm text-slate-500">
          Use your credentials to access the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full rounded-md border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="w-full rounded-md border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            className="w-full rounded-md bg-emerald-600 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
