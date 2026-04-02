import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Trash2, Pencil, X } from "lucide-react";

export default function Kanban() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    if (!projectId) return;

    try {
      const res = await API.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getTasks = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white p-4 md:p-6">
      
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-semibold">Kanban Board</h1>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column
          title="To Do"
          status="todo"
          tasks={getTasks("todo")}
          onDrop={updateTaskStatus}
          deleteTask={deleteTask}
          setEditingTask={setEditingTask}
        />
        <Column
          title="In Progress"
          status="in-progress"
          tasks={getTasks("in-progress")}
          onDrop={updateTaskStatus}
          deleteTask={deleteTask}
          setEditing美妙ik={setEditingTask}
        />
        <Column
          title="Done"
          status="done"
          tasks={getTasks("done")}
          onDrop={updateTaskStatus}
          deleteTask={deleteTask}
          setEditingTask={setEditingTask}
        />
      </div>

      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          refresh={fetchTasks}
        />
      )}
    </div>
  );
}


function Column({ title, status, tasks, onDrop, deleteTask, setEditingTask }) {
  const handleDrop = (e) => {
    const id = e.dataTransfer.getData("taskId");
    onDrop(id, status);
  };

 
  const borderColor =
    status === "todo" ? "border-red-500" :       
    status === "in-progress" ? "border-yellow-400" :
    "border-green-500";                              

  return (
    <div
      className={`bg-slate-800/70 rounded-2xl p-5 min-h-[480px] border-4 border-t-slate-900 hover:border-t-slate-700 transition-all ${borderColor}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-xs bg-slate-900/70 text-slate-400 px-3 py-1.5 rounded-lg">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-slate-500 text-sm text-center pt-8">No tasks</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              deleteTask={deleteTask}
              setEditingTask={setEditingTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}



function TaskCard({ task, deleteTask, setEditingTask }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
      className="bg-slate-900/70 border border-slate-700 p-4 rounded-xl mb-3 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] transition-all group"
    >
      
      <div className="flex justify-between items-center gap-3 mb-3">
        <p className="font-medium text-base text-white break-words">
          {task.title}
        </p>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => setEditingTask(task)}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 rounded-lg"
            aria-label="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => deleteTask(task._id)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      
      <div className="flex justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <User size={12} />
          {task.assignedTo?.[0]?.name || "Unassigned"}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1.5 text-blue-400">
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}


function EditModal({ task, onClose, refresh }) {
  const [title, setTitle] = useState(task.title);

  const handleUpdate = async () => {
    try {
      await API.put(`/tasks/${task._id}`, { title });
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800/90 p-6 rounded-2xl w-96 border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-2xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 text-white placeholder-slate-500 mb-4"
          placeholder="Task title"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-medium shadow-md hover:shadow-green-500/40 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}