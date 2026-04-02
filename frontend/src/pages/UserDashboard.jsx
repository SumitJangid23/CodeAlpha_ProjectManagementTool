import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const projectId = localStorage.getItem("projectId");

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${projectId}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

 
  const userTasks = tasks.filter(
    (t) => t.assignedTo?.[0]?._id === userId
  );

 
  const total = userTasks.length;
  const done = userTasks.filter((t) => t.status === "done").length;
  const progress = userTasks.filter((t) => t.status === "in-progress").length;
  const todo = userTasks.filter((t) => t.status === "todo").length;

 
  const completion =
    total === 0 ? 0 : Math.round((done / total) * 100);

 
  const today = new Date().toDateString();
  const todayTasks = userTasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate).toDateString() === today
  );

 
  const recentTasks = [...userTasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-white p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 className="text-3xl font-semibold text-white tracking-tight">
      My Dashboard
    </h1>
    <p className="text-slate-400 text-sm mt-1">Your personal task & progress overview.</p>
  </div>

  
  <button
    onClick={() => {
     
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
     
      navigate("/login");
    }}
    className="px-4 py-2 text-sm text-white hover:text-green-300 border border-slate-600 hover:border-green-500 rounded-xl transition-colors"
  >
    Logout
  </button>
</header>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card title="Total" value={total} />
        <Card title="Done" value={done} />
        <Card title="In Progress" value={progress} />
        <Card title="Pending" value={todo} />
      </div>

      
      <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 mb-8 shadow-sm hover:border-slate-600 transition-all">
        <p className="text-slate-400 mb-3 text-sm font-medium">Completion Progress</p>
        <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-300 font-medium">{completion}% completed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Today Tasks</h2>
          {todayTasks.length === 0 ? (
            <p className="text-slate-400 text-sm">No tasks due today.</p>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((t) => (
                <li
                  key={t._id}
                  className="text-sm text-slate-200 hover:text-white transition-colors"
                >
                  {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        
        <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent tasks.</p>
          ) : (
            <ul className="space-y-2">
              {recentTasks.map((t) => (
                <li
                  key={t._id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800/60 transition-all"
                >
                  <span className="text-sm text-slate-200 font-medium">{t.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      t.status === "done"
                        ? "bg-green-500/15 text-green-300"
                        : t.status === "in-progress"
                        ? "bg-yellow-500/15 text-yellow-300"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      
      <div className="text-center">
        <button
          onClick={() => navigate("/my-tasks")}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-2xl font-medium shadow-md hover:shadow-green-500/30 transition-all"
        >
          Go to My Tasks
        </button>
      </div>
    </div>
  );
}


function Card({ title, value }) {
  const contentHeight = "h-28 md:h-32";
  return (
    <div
      className={`bg-slate-800/70 p-5 rounded-2xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800/90 shadow-sm transition-all ${contentHeight}`}
    >
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <h2 className="text-3xl font-semibold text-white">{value}</h2>
    </div>
  );
}