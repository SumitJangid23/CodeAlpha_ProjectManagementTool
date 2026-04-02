import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, CheckCircle, Users, Zap } from "lucide-react";
import API from "../services/api";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.role) return alert("Please select role");

    try {
      await API.post("/auth/signup", form);
      alert("Account created successfully. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-slate-800/70 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-slate-900/90 to-slate-900/70 border-r border-slate-700">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Join Crest
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Start managing tasks, analyzing performance, and tracking risks from day one.
          </p>
          <div className="space-y-4">
            <Benefit
              icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
              text="Organize tasks efficiently"
            />
            <Benefit
              icon={<Users className="h-5 w-5 text-blue-400" />}
              text="Collaborate with your team"
            />
            <Benefit
              icon={<Zap className="h-5 w-5 text-purple-400" />}
              text="Boost productivity with insights"
            />
          </div>
        </div>

        
        <div className="p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-2">Create your account</h3>
            <p className="text-slate-400 text-base">Join and start using Crest</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-white placeholder-slate-500 transition-all shadow-md hover:shadow-lg"
              required
            />

            
            <input
              type="email"
              name="email"
              placeholder="your.email@company.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-white placeholder-slate-500 transition-all shadow-md hover:shadow-lg"
              required
            />

            
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
              className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-white shadow-md hover:shadow-lg transition-all"
              required
            >
              <option value="">Select Role</option>
              <option value="manager">Manager</option>
              <option value="member">User</option>
            </select>

            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
              disabled={!form.name || !form.email || !form.password || !form.role}
            >
              Sign Up
            </button>
          </form>

          <p className="text-sm text-slate-400 mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="hover:text-green-400 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


function Benefit({ icon, text }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl border border-slate-600/50 hover:border-green-400/50 hover:shadow-md group">
      <span className="text-green-400 group-hover:text-white transition-colors">{icon}</span>
      <span className="text-slate-300 group-hover:text-white transition-colors">{text}</span>
    </div>
  );
}