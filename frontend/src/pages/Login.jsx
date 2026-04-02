import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, BarChart, ShieldAlert, Activity } from "lucide-react";
import API from "../services/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.role) return alert("Please select role");

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "manager") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 flex items-center justify-center px-4 py-12">
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-slate-800/70 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        
        
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-slate-900/90 to-slate-900/70 border-r border-slate-700">
          <h2 className="text-3xl font-bold mb-8 text-white">
            Welcome to <span className="text-green-400">Crest</span>
          </h2>
          
          <p className="text-slate-400 mb-10 leading-relaxed">
            Manage tasks, analyze performance, detect risks.
          </p>
          
          <div className="space-y-4">
            <Feature icon={<BarChart className="text-emerald-400" />} text="Analytics Dashboard" />
            <Feature icon={<ShieldAlert className="text-orange-400" />} text="Risk Detection" />
            <Feature icon={<Activity className="text-purple-400" />} text="Health Score Tracking" />
          </div>
        </div>

        
        <div className="p-10 flex flex-col justify-center">
          
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-3">Sign In</h3>
            <p className="text-slate-400 text-lg">Access your Crest dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="your.email@company.com"
                value={form.email}
                onChange={handleChange}
                className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-white placeholder-slate-500 transition-all shadow-md hover:shadow-lg"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full p-4 pr-12 bg-slate-800/80 border border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-white placeholder-slate-500 transition-all shadow-md hover:shadow-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-green-400 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-white appearance-none bg-no-repeat pr-10 shadow-md hover:shadow-lg transition-all"
              required
            >
              <option value="">Select Role</option>
              <option value="manager"> Manager</option>
              <option value="member"> User</option>
            </select>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
              disabled={!form.email || !form.password || !form.role}
            >
              Sign In
            </button>
          </form>

          <div className="flex justify-between pt-8 border-t border-slate-700 text-sm text-slate-400">
            <Link to="/forgot-password" className="hover:text-green-400 transition-all">
              Forgot Password?
            </Link>
            <Link to="/signup" className="hover:text-green-400 transition-all">
              Don't have account? Sign Up
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}


function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-700/80 transition-all rounded-xl border border-slate-600/50 hover:border-green-400/50 hover:shadow-md">
      <div className="w-12 h-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl flex items-center justify-center border border-slate-600/50 hover:border-current hover:bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-lg transition-all">
        {icon}
      </div>
      <span className="font-semibold text-slate-200 hover:text-white transition-colors">{text}</span>
    </div>
  );
}