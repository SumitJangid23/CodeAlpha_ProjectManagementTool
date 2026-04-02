import { Link } from "react-router-dom";
import {
  BarChart, ShieldAlert, Users, Clock, Activity, KanbanSquare,
  Mail, Phone
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-[#e2e8f0] min-h-screen">
      
      
      <section className="min-h-screen flex flex-col">
        
        
        <div className="flex-1 flex items-center justify-center px-6 py-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-radial from-green-500/5 to-transparent blur-xl"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Welcome to <span className="text-green-400 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Crest</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Manage tasks • Track progress • Detect risks • Boost productivity
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/login">
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all">
                  Get Started
                </button>
              </Link>
              <a href="#features" className="border border-slate-600 px-10 py-4 rounded-2xl font-bold text-lg hover:border-green-500 hover:text-green-400 transition-all">
                View Features
              </a>
            </div>
          </div>
        </div>

        
        <div id="features" className="px-6 pb-12 bg-gradient-to-t from-slate-900/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 pt-8">Core Features</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Feature icon={<KanbanSquare />} title="Kanban" desc="Drag & drop" />
              <Feature icon={<BarChart />} title="Analytics" desc="Real-time" />
              <Feature icon={<Clock />} title="Time Track" desc="Auto logs" />
              <Feature icon={<Users />} title="Workload" desc="Team balance" />
              <Feature icon={<ShieldAlert />} title="Risk Alert" desc="AI detect" />
              <Feature icon={<Activity />} title="Health" desc="Metrics" />
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-12 px-6 bg-slate-800/30 border-y border-slate-700">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-4">About Crest</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Modern PM tool for teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-green-500 transition">
              <Mail className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-bold mb-1">Email</p>
              <a href="mailto:support@crestapp.com" className="text-green-400 text-sm block">support@crestapp.com</a>
            </div>
            
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-green-500 transition">
              <Phone className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-bold mb-1">Phone</p>
              <a href="tel:+919876543210" className="text-green-400 text-sm block">+91 98765 43210</a>
            </div>
            
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <p className="font-bold mb-1">Hours</p>
              <p className="text-slate-400 text-sm">9AM-6PM IST</p>
            </div>
          </div>

          <Link to="/login">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all">
              Start Free Trial
            </button>
          </Link>
        </div>
      </section>

      
      <footer className="border-t border-slate-700 py-6 px-6 text-center text-slate-500 text-sm">
        © 2026 Crest. All rights reserved.
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="group bg-slate-800/80 p-6 rounded-xl border border-slate-700 hover:border-green-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-center h-32 flex flex-col justify-center hover:bg-slate-800">
      <div className="text-green-400 mb-3 mx-auto w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-lg group-hover:bg-green-500/20 transition-all">
        {icon}
      </div>
      <h4 className="font-bold text-lg mb-1 leading-tight">{title}</h4>
      <p className="text-slate-400 text-xs">{desc}</p>
    </div>
  );
}