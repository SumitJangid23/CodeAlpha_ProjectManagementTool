import { Link } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/forgot-password", { email });
      alert("Reset link sent (check console/token response)");
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl text-white text-center font-semibold mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="text-sm text-slate-300 block mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 shadow-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
            required
          />

          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md hover:shadow-green-500/30 transition-all"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-green-400 hover:text-green-300 font-medium"
          >
            Login instead
          </Link>
        </p>
      </div>
    </div>
  );
}