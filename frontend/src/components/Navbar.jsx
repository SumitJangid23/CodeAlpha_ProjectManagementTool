import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0f172a]/70 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      
      <h1 className="text-xl font-bold">Crest</h1>

      

      <div className="flex gap-3">
        <Link to="/login" className="px-4 py-2 border border-slate-600 rounded-lg hover:border-green-500">
          Sign in
        </Link>

        <Link to="/signup" className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600">
          Sign Up
        </Link>
      </div>

    </nav>
  );
} 