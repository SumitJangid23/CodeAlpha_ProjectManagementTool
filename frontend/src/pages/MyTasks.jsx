import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";
import { Play, Square, X } from "lucide-react";

const socket = io("http://localhost:5000");

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [liveTime, setLiveTime] = useState(0);
  const [comment, setComment] = useState("");
  const projectId = localStorage.getItem("projectId");
  const userId = localStorage.getItem("userId");

 
  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${projectId}`);
      if (Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        console.warn("Backend did not return array:", res.data);
        setTasks([]);
      }
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

 
  useEffect(() => {
    if (!selectedTask) return;

    let interval;
    if (selectedTask.timerStartedAt) {
      interval = setInterval(() => {
        const diff =
          (new Date() - new Date(selectedTask.timerStartedAt)) / 1000;
        setLiveTime((selectedTask.timeSpent || 0) + diff);
      }, 1000);
    } else {
      setLiveTime(selectedTask.timeSpent || 0);
    }

    return () => clearInterval(interval);
  }, [selectedTask]);

 
  const openTask = async (task) => {
    setSelectedTask(task);
    try {
      const res = await API.get(`/comments/${task._id}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setComments([]);
    }
    setLiveTime(task.timeSpent || 0);
  };

 
  const closeTask = () => {
    setSelectedTask(null);
  };

 
  useEffect(() => {
    const handler = (c) => {
      if (c.task === selectedTask?._id) {
        setComments((prev) => [...prev, c]);
      }
    };

    socket.on("newComment", handler);

    return () => socket.off("newComment", handler);
  }, [selectedTask]);

 
  const sendComment = async (taskId) => {
    if (!comment.trim()) return;

    try {
      await API.post("/comments", {
        text: comment,
        taskId,
      });
      setComment("");
    } catch (err) {
      console.error(err);
    }
  };

 
  const startTimer = async (id) => {
    try {
      const res = await API.put(`/tasks/${id}/start`);
      const updated = res.data.task;

      setSelectedTask(updated);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );

      const resComments = await API.get(`/comments/${id}`);
      setComments(Array.isArray(resComments.data) ? resComments.data : []);
    } catch (err) {
      console.error(err);
    }
  };

 
  const stopTimer = async (id) => {
    try {
      const res = await API.put(`/tasks/${id}/stop`);
      const updated = res.data.task;

      setSelectedTask(updated);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );

      const resComments = await API.get(`/comments/${id}`);
      setComments(Array.isArray(resComments.data) ? resComments.data : []);
    } catch (err) {
      console.error(err);
    }
  };

 
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      fetchTasks();

      if (selectedTask && selectedTask._id === id) {
        setSelectedTask((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      console.error(err);
    }
  };

 
  const getStatusColor = (status) => {
    if (status === "done")
      return "bg-green-500/15 text-green-300 border border-green-500/30";
    if (status === "in-progress")
      return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30";
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  };

 
  const userTasks = tasks.filter((t) => {
    if (!t.assignedTo) return false;

    if (Array.isArray(t.assignedTo)) {
      return t.assignedTo.some((a) => a?._id === userId);
    }

   
    return t.assignedTo._id === userId;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-white p-6 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userTasks.map((task) => (
          <div
            key={task._id}
            className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 group transition-all"
          >
            <h3 className="text-lg font-semibold text-white break-words">
              {task.title}
            </h3>

            <div className="flex justify-between mt-3">
              <span
                className={`text-xs px-3 py-1.5 rounded-full ${getStatusColor(task.status)}`}
              >
                {task.status}
              </span>
              <span className="text-sm text-slate-400">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "--"}
              </span>
            </div>

            <div className="mt-4 text-sm text-slate-300">
              Time: {Math.floor((task.timeSpent || 0) / 60)} min
            </div>

            <div className="mt-5">
              <button
                onClick={() => openTask(task)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md hover:shadow-green-500/30 transition-all"
              >
                View Task
              </button>
            </div>
          </div>
        ))}
      </div>

      
      {selectedTask && (
        <div className="w-96 bg-slate-900/90 border-l border-slate-700 p-6 flex flex-col shadow-2xl">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white truncate">
              {selectedTask.title}
            </h2>
            <button
              onClick={closeTask}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          
          <div className="mb-6 border-b border-slate-800 pb-4">
            <div className="flex justify-between items-center">
              <span
                className={`text-sm px-3 py-1.5 rounded-full ${getStatusColor(selectedTask.status)}`}
              >
                {selectedTask.status}
              </span>
              <span className="text-sm text-slate-400">
                {selectedTask.dueDate
                  ? new Date(selectedTask.dueDate).toLocaleDateString()
                  : "--"}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => updateStatus(selectedTask._id, "todo")}
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                  selectedTask.status === "todo"
                    ? "bg-red-500/20 text-red-300 border-red-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}
              >
                Todo
              </button>
              <button
                onClick={() => updateStatus(selectedTask._id, "in-progress")}
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                  selectedTask.status === "in-progress"
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => updateStatus(selectedTask._id, "done")}
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                  selectedTask.status === "done"
                    ? "bg-green-500/20 text-green-300 border-green-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}
              >
                Done
              </button>
            </div>
          </div>

          
          <div className="mb-6">
            <p className="text-sm text-slate-300 font-medium">
              Time: {Math.floor((selectedTask.timeSpent || 0) / 60)} min
            </p>

            {selectedTask.timerStartedAt ? (
              <p className="text-sm text-green-300 font-medium mb-2">
                Live: {Math.floor(liveTime / 60)}:{(liveTime % 60).toFixed(0).padStart(2, "0")}
              </p>
            ) : (
              <p className="text-sm text-slate-400 mb-2">Timer not running</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => startTimer(selectedTask._id)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md hover:shadow-green-500/30 transition-all"
              >
                <Play size={16} /> Start
              </button>
              <button
                onClick={() => stopTimer(selectedTask._id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium shadow-md hover:shadow-red-500/30 transition-all"
              >
                <Square size={16} /> Stop
              </button>
            </div>
          </div>

          
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                No comments yet.
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c._id}
                  className="bg-slate-800/60 p-4 rounded-xl border border-slate-700"
                >
                  <p className="text-sm text-white">{c.text}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {c.user?.name} • {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/10 text-white outline-none placeholder-slate-500 text-sm"
              onKeyPress={(e) => e.key === "Enter" && sendComment(selectedTask._id)}
            />
            <button
              onClick={() => sendComment(selectedTask._id)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md hover:shadow-green-500/30 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}