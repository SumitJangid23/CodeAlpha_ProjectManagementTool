import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { io } from "socket.io-client";
import {
  Bell,
  LogOut,
  Plus,
  LayoutDashboard,
  Folder,
  BarChart2,
  KanbanSquare,
  Menu,
  X,
  Activity,
  ShieldAlert,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  XCircle
} from "lucide-react";
import { Link, useLocation, useNavigate} from "react-router-dom";

const socket = io("http://localhost:5000");

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [health, setHealth] = useState(null);
  const [risk, setRisk] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role")|| "");
  const userId = localStorage.getItem("userId");
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [taskData, setTaskData] = useState({
    title: "",
    assignedTo: "",
    dueDate: "",
  });
 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const deleteRef = useRef();
  const visibleTasks = role === "manager" ? tasks : tasks.filter(t => t.assignedTo?.[0]?._id === userId);

  const handleEdit = (task) => {
    setEditTask(task);
    setEditTitle(task.title);
  };

  const saveEdit = async () => {
    try {
      const res = await API.put(`/tasks/${editTask._id}`, { title: editTitle });
      setTasks((prev) => prev.map((t) => t._id === editTask._id ? res.data : t));
      setEditTask(null);
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTaskId) return;
    try {
      await API.delete(`/tasks/${deleteTaskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== deleteTaskId));
      setShowDeleteModal(false);
      setDeleteTaskId(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const calculatedHealth = (() => {
    if (!tasks.length) return 0;
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "done").length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
    let score = (completed / total) * 100;
    score -= overdue * 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  })();

  const getStatus = () => {
    if (tasks.length === 0) return "--";
    const done = tasks.filter(t => t.status === "done").length;
    if (done === tasks.length) return "Completed";
    if (done > tasks.length / 2) return "On Track";
    return "At Risk";
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem("projectId", selectedProject);
      fetchHealth();
      fetchRisk();
      fetchTasks();
      socket.emit("joinProject", selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    socket.on("taskCreated", (data) => {
      addNotification(data?.message || "New task created");
      fetchTasks();
    });
    socket.on("taskUpdated", (data) => {
      addNotification(data?.message || "Task updated");
      fetchTasks();
    });
    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await API.get(`/health/${selectedProject}`);
      setHealth(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRisk = async () => {
    try {
      const res = await API.get(`/risk/${selectedProject}`);
      setRisk(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${selectedProject}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addNotification = (msg) => {
    const id = Date.now();
    setNotifications((prev) => [{ msg, id }, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async () => {
    try {
      if (!taskData.title || !taskData.assignedTo) return alert("Fill all fields");
      if (!selectedProject) return alert("Please select a project");
      await API.post("/tasks", {
        ...taskData,
        assignedTo: [taskData.assignedTo],
        projectId: selectedProject,
      });
      alert("Task created successfully");
      setShowModal(false);
      setTaskData({ title: "", assignedTo: "", dueDate: "" });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Task failed");
    }
  };

  const linkClass = (path) =>
    `nav-link ${location.pathname === path ? "text-white bg-slate-700/50" : "text-slate-400 hover:text-white hover:bg-slate-700/50"} transition-all p-3 rounded-xl flex items-center gap-3 font-medium`;

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotif) {
        setShowNotif(false);
      }
    };

    if (showNotif) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotif]);

 
  useEffect(() => {
    function handleClickOutside(event) {
      if (deleteRef.current && !deleteRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setDeleteTaskId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900">
      
      <div className="fixed top-0 left-0 right-0 z-40 md:left-64 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenSidebar(true)}
              className="p-2 lg:p-3 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all shadow-md md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 hidden lg:block">Project management & analytics</p>
            </div>
          </div>

          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotif(!showNotif);
                }}
                className="p-2 sm:p-3 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-green-400 relative transition-all shadow-md"
              >
                <Bell size={18} />
              </button>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-slate-900">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </div>

            <span className="text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/50 px-3 py-1 rounded-xl whitespace-nowrap hidden sm:inline">
              {localStorage.getItem("userName")}
            </span>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all text-sm flex items-center gap-1"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      
     <div className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-slate-900/95 backdrop-blur-md border-r border-slate-700 transform transition-transform duration-300 ${
  openSidebar ? "translate-x-0" : "-translate-x-full"
} md:translate-x-0`}>
        <div className="p-6 border-b border-slate-800 pt-16 md:pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-sm">C</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Crest
            </h2>
          </div>
          <button
            onClick={() => setOpenSidebar(false)}
            className="md:hidden w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2 pt-4">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/projects" className={linkClass("/projects")}>
            <Folder size={18} /> Projects
          </Link>
          <Link to="/analytics" className={linkClass("/analytics")}>
            <BarChart2 size={18} /> Analytics
          </Link>
          <Link to={`/kanban/${selectedProject}`} className={linkClass("/kanban")}>
            <KanbanSquare size={18} /> Board
          </Link>
        </nav>
      </div>

      
      {openSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      
     <div className="md:ml-64 pt-36 p-4 sm:p-6 max-w-6xl mx-auto">
        
      <div className="mb-6 mt-10 flex flex-col gap-2">
  <label className="text-sm text-slate-400 font-medium">
    Select Project
  </label>

  <select
    className="w-64 p-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-green-500"
    value={selectedProject}
    onChange={(e) => setSelectedProject(e.target.value)}
  >
    <option value="">Select Project</option>
    {projects.map(p => (
      <option key={p._id} value={p._id}>
        {p.name || p.title}
      </option>
    ))}
  </select>
</div>

        
        {role === "manager" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={<Activity className="text-emerald-400" size={20} />} 
              title="Health" 
              value={`${calculatedHealth || 0}%`}
            />
            <StatCard 
              icon={<ShieldAlert className="text-orange-400" size={20} />} 
              title="Status" 
              value={getStatus()}
            />
            <StatCard 
              icon={<BarChart2 className="text-purple-400" size={20} />} 
              title="Completion" 
              value={`${tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)}%`}
            />
            <StatCard 
              icon={<AlertCircle className="text-red-400" size={20} />} 
              title="Overdue" 
              value={tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length}
            />
          </div>
        )}

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {role === "manager" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-2xl font-semibold shadow-lg hover:shadow-green-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={18} /> Create Task
            </button>
          )}
          <button
            onClick={() => {
              if (!selectedProject) return alert("Select a project first");
              navigate(`/kanban/${selectedProject}`);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-2xl font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <KanbanSquare size={18} /> Open Kanban
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-slate-800/70 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              Tasks ({visibleTasks.length})
            </h2>
            {visibleTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {visibleTasks.slice(0, 8).map(task => (
                  <TaskItem key={task._id} task={task} onEdit={handleEdit} onDelete={(id) => {
                    setDeleteTaskId(id);
                    setShowDeleteModal(true);
                  }} />
                ))}
                {visibleTasks.length > 8 && (
                  <div className="text-center pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm">Showing 8 of {visibleTasks.length} tasks</p>
                  </div>
                )}
              </div>
            )}
          </div>

          
          <div className="bg-slate-800/70 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-400">
              <AlertCircle size={24} /> Risk Alerts
            </h2>
            {(() => {
              const risks = [];
              tasks.forEach(t => {
                if (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done") {
                  risks.push(`"${t.title}" is overdue`);
                }
              });
              if (tasks.length > 0) {
                const done = tasks.filter(t => t.status === "done").length;
                const percent = (done / tasks.length) * 100;
                if (percent < 40) risks.push("Project completion is very low");
              }
              if (tasks.length === 0) risks.push("No tasks created yet");
              const backendRisks = risk?.risks || [];
              const allRisks = [...backendRisks, ...risks];

              return allRisks.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {allRisks.slice(0, 6).map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 hover:bg-red-500/20 transition-all text-sm">
                      <AlertCircle size={18} className="mt-1 flex-shrink-0 opacity-80" />
                      <span className="leading-relaxed">{r}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-xl text-green-200 text-center">
                  <ShieldAlert size={40} className="mx-auto mb-3 opacity-80" />
                  <p className="font-semibold text-lg">No risks detected</p>
                  <p className="text-sm mt-1 opacity-80">Project is healthy</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      
      {showNotif && (
        <div className="fixed top-16 md:top-12 right-4 w-80 bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 max-h-96 overflow-y-auto">
          <h4 className="font-bold mb-3 text-white flex items-center gap-2 pb-2 border-b border-slate-700">
            <Bell size={18} /> Notifications
          </h4>
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No new updates</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="py-3 px-3 border-b border-slate-700 last:border-b-0 text-sm hover:bg-slate-700/50 rounded-xl transition-all">
                {n.msg}
              </div>
            ))
          )}
        </div>
      )}

      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          setShowDeleteModal(false);
          setDeleteTaskId(null);
        }}>
          <div ref={deleteRef} className="bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Task?</h3>
              <p className="text-slate-400 text-sm mb-8 max-w-[280px]">
                This action cannot be undone. Are you sure you want to delete this task?
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTaskId(null);
                }}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 py-4 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all text-sm flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      
      {editTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditTask(null)}>
          <div className="bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
              <Edit2 size={20} className="text-yellow-400" />
              Edit Task
            </h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-4 bg-slate-700/80 border border-slate-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 text-white mb-6 shadow-md transition-all"
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setEditTask(null)}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 py-3 rounded-xl font-semibold transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-yellow-500/25 hover:scale-[1.02] transition-all text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-2xl w-full max-w-md p-8 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent flex items-center gap-2">
                <Plus size={24} className="text-green-400" />
                Create Task
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="title"
                placeholder="Task Title"
                value={taskData.title}
                onChange={handleChange}
                className="w-full p-4 bg-slate-700/80 border border-slate-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/30 text-white placeholder-slate-400 shadow-md hover:shadow-lg transition-all"
              />
              <select
                name="assignedTo"
                value={taskData.assignedTo}
                onChange={handleChange}
                className="w-full p-4 bg-slate-700/80 border border-slate-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/30 text-white shadow-md hover:shadow-lg transition-all"
              >
                <option value="">Assign User</option>
                {users.filter(u => u._id !== userId).map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
              <input
                type="date"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
                className="w-full p-4 bg-slate-700/80 border border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white shadow-md hover:shadow-lg transition-all"
              />
              <button
                onClick={handleCreateTask}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-xl font-bold shadow-lg hover:shadow-green-500/25 hover:scale-[1.02] transition-all text-sm"
              >
                <Plus size={18} className="inline mr-2" /> Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function StatCard({ icon, title, value }) {
  return (
    <div className="group p-4 sm:p-5 bg-slate-800/70 backdrop-blur border border-slate-700/50 hover:border-green-500/50 rounded-2xl hover:shadow-xl hover:shadow-green-500/20 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 bg-slate-700/50 group-hover:bg-emerald-500/20 rounded-xl border border-slate-600/50 group-hover:border-emerald-400/50 transition-all">
          {icon}
        </div>
      </div>
      <p className="text-slate-400 text-xs sm:text-sm mb-2 font-medium opacity-90">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent group-hover:from-emerald-400 group-hover:to-green-400 transition-all">
        {value}
      </h3>
    </div>
  );
}

function TaskItem({ task, onEdit, onDelete }) {
  return (
    <div className="group bg-slate-700/50 hover:bg-slate-700/80 border border-slate-600/50 hover:border-green-500/40 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm leading-tight mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
            {task.title}
          </p>
          <div className="flex flex-wrap gap-2 text-xs mb-2">
            <span className="bg-slate-600/50 px-2.5 py-1 rounded-lg text-slate-300 font-medium">
              {task.assignedTo?.[0]?.name || "Unassigned"}
            </span>
            {task.dueDate && (
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg font-medium text-xs">
                {new Date(task.dueDate).toLocaleDateString('short')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 hover:bg-yellow-500/20 rounded-lg text-yellow-400 hover:text-yellow-300 transition-all hover:scale-110"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all hover:scale-110"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 ml-1 ${
          task.status === "done"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : task.status === "in-progress"
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {task.status?.replace('-', ' ') || 'pending'}
        </span>
      </div>
    </div>
  );
}