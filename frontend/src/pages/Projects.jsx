import { useEffect, useState } from "react";
import API from "../services/api";
import { Plus, Pencil, X, Check, Folder, ChevronRight } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const createProject = async () => {
    if (!name.trim()) return;
    try {
      await API.post("/projects", { title: name });
      setName("");
      fetchProjects();
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const updateProject = async (id) => {
    if (!editName.trim()) return;
    try {
      await API.put(`/projects/${id}`, { title: editName });
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;

    setDeletingId(id);
    setTimeout(async () => {
      try {
        await API.delete(`/projects/${id}`);
        setProjects(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete project");
      } finally {
        setDeletingId(null);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, edit, and manage your projects.
          </p>
        </div>

        
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name"
            className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-white placeholder-slate-500 transition-all"
          />
          <button
            onClick={createProject}            
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-medium shadow-md hover:shadow-green-500/30 transition-all flex items-center gap-2"
          >
            <Plus size={18} className="inline" /> Add Project
          </button>
        </div>

        
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p._id}
              className={`
                flex items-center justify-between
                bg-slate-800/70 border border-slate-700 rounded-2xl p-4
                transition-all duration-300
                ${
                  deletingId === p._id
                    ? "opacity-0 -translate-x-4 scale-95"
                    : "hover:border-slate-600 hover:bg-slate-800/90"
                }
                ${
                  editingId === p._id ? "ring-2 ring-green-500/40" : ""
                }
              `}
            >
              {editingId === p._id ? (
                
                <div className="flex w-full flex-wrap items-center gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-green-500/50 rounded-lg outline-none text-white placeholder-slate-400"
                    placeholder="Project title"
                  />
                  <button
                    onClick={() => updateProject(p._id)}
                    className="p-2 bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
                    aria-label="Save"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                    aria-label="Cancel edit"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 border border-green-500/40">
                      <ChevronRight size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-medium text-white">
                        {p.title}
                      </h2>
                      <span className="text-xs text-slate-500 font-mono">
                        ID: {p._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingId(p._id);
                        setEditName(p.title);
                      }}
                      className="text-xs p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                      aria-label="Edit project"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-xs p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      aria-label="Delete project"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}