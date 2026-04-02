import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ClipboardList,
  BarChart3,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [health, setHealth] = useState(null);
  const [risk, setRisk] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    fetchHealth();
    fetchRisk();
    fetchWorkload();
    fetchTasks();
  }, [selectedProject]);

  const calculatedHealth = (() => {
    if (!tasks.length) return 0;

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== "done"
    ).length;

    let score = (completed / total) * 100;
    score -= overdue * 5;
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return Math.round(score);
  })();

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data || []);
      if (res.data?.length > 0) {
        setSelectedProject(res.data[0]._id);
      }
    } catch (err) {
      console.error("Projects error:", err);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await API.get(`/health/${selectedProject}`);
      setHealth(res.data);
    } catch (err) {
      console.error("Health error:", err);
    }
  };

  const fetchRisk = async () => {
    try {
      const res = await API.get(`/risk/${selectedProject}`);
      setRisk(res.data);
    } catch (err) {
      console.error("Risk error:", err);
    }
  };

  const fetchWorkload = async () => {
    try {
      const res = await API.get(`/workload/${selectedProject}`);
      setWorkload(res.data);
    } catch (err) {
      console.error("Workload error:", err);
      setWorkload(null);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${selectedProject}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Tasks error:", err);
      setTasks([]);
    }
  };

  const taskStats = useMemo(() => {
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;

    return [
      { name: "To Do", value: todo },
      { name: "In Progress", value: inProgress },
      { name: "Done", value: done },
    ];
  }, [tasks]);

  const workloadData = useMemo(() => {
    if (!workload) return [];

    const data =
      Array.isArray(workload.users)
        ? workload.users
        : Array.isArray(workload)
        ? workload
        : [];

    return data.map((u) => ({
      name: u.name || "Unknown",
      time: Math.floor((u.time || 0) / 60),
      tasks: u.tasks || 0,
    }));
  }, [workload]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0)
      )
      .slice(0, 5);
  }, [tasks]);

  const pieColors = ["#f87171", "#facc15", "#4ade80"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Analytics</h1>
            <p className="text-slate-400 text-sm">
              Monitor project health, risk, workload, and delivery progress.
            </p>
          </div>

          <select
            className="w-full md:w-72 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-white outline-none"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title || p.name || "Untitled Project"}
              </option>
            ))}
          </select>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Health Score"
            value={calculatedHealth}
            suffix="/100"
            icon={
              <Activity
                size={18}
                className="text-emerald-400"
                strokeWidth={2.2}
              />
            }
          />
          <StatCard
            title="Completion"
            value={
              tasks.length === 0
                ? 0
                : Math.round(
                    (tasks.filter((t) => t.status === "done").length /
                      tasks.length) *
                      100
                  )
            }
            suffix="%"
            icon={
              <CheckCircle2
                size={18}
                className="text-green-400"
                strokeWidth={2.2}
              />
            }
          />
          <StatCard
            title="Overdue Tasks"
            value={
              tasks.filter(
                (t) =>
                  t.dueDate &&
                  new Date(t.dueDate) < new Date() &&
                  t.status !== "done"
              ).length
            }
            icon={
              <Clock3
                size={18}
                className="text-yellow-400"
                strokeWidth={2}
              />
            }
          />
          <StatCard
            title="Total Tasks"
            value={tasks.length}
            icon={
              <ClipboardList
                size={18}
                className="text-slate-400"
                strokeWidth={2}
              />
            }
          />
        </div>

        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <Panel className="xl:col-span-2">
            <PanelHeader
              title="Task Status Distribution"
              subtitle="Current breakdown of tasks by status"
              icon={
                <BarChart3
                  size={18}
                  className="text-emerald-400"
                  strokeWidth={2.2}
                />
              }
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStats}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {taskStats.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {taskStats.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pieColors[i] }}
                      />
                      <span className="text-slate-200">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}

                <div className="rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-4">
                  <p className="text-slate-400 text-sm mb-1">Project Status</p>
                  <p className="text-lg font-semibold">{health?.status || "No status"}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Risk Alerts"
              subtitle="Detected issues that need attention"
              icon={
                <AlertTriangle
                  size={18}
                  className="text-orange-400"
                  strokeWidth={2.2}
                />
              }
            />
            <div className="space-y-3">
              {(() => {
                const risks = [];

               
                tasks.forEach((t) => {
                  if (
                    t.dueDate &&
                    new Date(t.dueDate) < new Date() &&
                    t.status !== "done"
                  ) {
                    risks.push(`"${t.title}" is overdue`);
                  }
                });

               
                if (tasks.length > 0) {
                  const done = tasks.filter((t) => t.status === "done").length;
                  const percent = (done / tasks.length) * 100;
                  if (percent < 40) {
                    risks.push("Low project completion");
                  }
                }

               
                const userLoad = {};
                tasks.forEach((t) => {
                  const name = t.assignedTo?.[0]?.name;
                  if (name) {
                    userLoad[name] = (userLoad[name] || 0) + 1;
                  }
                });

                Object.entries(userLoad).forEach(([user, count]) => {
                  if (count > 5) {
                    risks.push(`${user} has too many tasks`);
                  }
                });

                const backendRisks = risk?.risks || [];
                const allRisks = [...backendRisks, ...risks];

                return allRisks.length > 0 ? (
                  allRisks.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300 text-sm"
                    >
                      {typeof r === "string" ? r : r.message}
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-300 text-sm">
                    No risks detected
                  </div>
                );
              })()}
            </div>
          </Panel>
        </div>

        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Panel className="xl:col-span-2">
            <PanelHeader
              title="Workload Balance"
              subtitle="Tasks distributed across team members"
              icon={
                <Users
                  size={18}
                  className="text-blue-400"
                  strokeWidth={2.2}
                />
              }
            />
            <div className="h-80">
              {workloadData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="time" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 rounded-lg border border-slate-800 bg-slate-800/60">
                  No workload data available
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {workloadData.map((u, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-800/60 border border-slate-700 px-4 py-2 rounded-lg"
                >
                  <span className="text-slate-200">{u.name}</span>
                  <div className="text-xs text-slate-400 text-right">
                    <p>{u.time} min</p>
                    <p>{u.tasks} tasks</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-slate-800/60 border border-slate-700 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Suggestion</p>
              <p className="text-green-400 font-medium">
                {workload?.suggestion || "No suggestion"}
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Recent Tasks"
              subtitle="Most recently updated tasks"
              icon={
                <ClipboardList
                  size={18}
                  className="text-slate-400"
                  strokeWidth={2}
                />
              }
            />
            <div className="space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {task.assignedTo?.[0]?.name || "Unassigned"}
                        </p>
                      </div>
                      <span className={statusBadge(task.status)}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3 text-slate-500 text-sm">
                  No tasks found
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, suffix = "", icon }) {
  return (
    <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-5 shadow-sm hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">{title}</p>
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex items-end gap-1">
        <h2 className="text-3xl font-semibold leading-none text-white">{value}</h2>
        {suffix ? <span className="text-slate-400 mb-1">{suffix}</span> : null}
      </div>
    </div>
  );
}

function PanelHeader({ title, subtitle, icon }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className="text-white">{icon}</div>
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-slate-800/70 border border-slate-700 p-5 shadow-sm hover:border-slate-600 transition-all ${className}`}
    >
      {children}
    </div>
  );
}

function statusBadge(status) {
  if (status === "done") {
    return "text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300";
  }
  if (status === "in-progress") {
    return "text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300";
  }
  return "text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300";
}