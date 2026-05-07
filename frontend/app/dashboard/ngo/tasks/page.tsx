"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, XCircle, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";
import { fetchNgoTasks, deleteTask, completeTask, Task } from "@/app/lib/taskService";
import { checkBackendHealth } from "@/app/lib/api";
import dynamic from "next/dynamic";

// Lazy load the modal to avoid build issues
const EditTaskModal = dynamic(() => import("@/app/components/EditTaskModal"), { ssr: false });

export default function TasksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    const checkAuthAndLoadTasks = async () => {
      const token = localStorage.getItem("authToken");
      
      console.log("[TasksPage] Token check:", token ? "Found" : "Not found");
      
      if (!token) {
        console.log("[TasksPage] No token, showing login redirect");
        toast({
          title: "Authentication Required",
          description: "Please log in to view your tasks",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
        return;
      }

      console.log("[TasksPage] Token found, loading tasks...");
      await loadTasks();
    };

    checkAuthAndLoadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      console.log("[TasksPage] Fetching tasks...");
      const response = await fetchNgoTasks();
      console.log("[TasksPage] Tasks loaded:", response.data?.length);
      setTasks(response.data || []);
    } catch (error: any) {
      const errorMsg = error.message || "Failed to load tasks";
      console.error("[TasksPage] Error:", errorMsg);
      
      // Check if it's an auth error
      if (errorMsg.includes("401") || errorMsg.includes("Unauthorized") || errorMsg.includes("Session")) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          localStorage.removeItem("authToken");
          router.push("/login");
        }, 1500);
        return;
      }

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    await loadTasks();
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteTask(id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      await completeTask(id);
      toast({
        title: "Success",
        description: "Task marked as completed",
      });
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, status: "completed" } : task
        )
      );
    } catch (error: any) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your tasks.</p>
          <button 
            onClick={() => router.push("/login")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-gray-500">
            Manage, edit, close, or delete your posted tasks.
          </p>
        </div>

        <button 
          onClick={() => router.push("/dashboard/ngo/post-task")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {tasks.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-500 mb-4">No tasks yet. Create your first task!</p>
            <button 
              onClick={() => router.push("/dashboard/ngo/post-task")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Create Task
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const progress =
              task.quota > 0 ? (task.filled_quota / task.quota) * 100 : 0;

            return (
              <div
                key={task.id}
                className="bg-white p-6 rounded-xl shadow border"
              >
                {/* Top */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold">
                        {task.title}
                      </h2>

                      {task.status === "active" && (
                        <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}

                      {task.status === "completed" && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}

                      {task.status === "paused" && (
                        <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                          Paused
                        </span>
                      )}

                      {task.status === "cancelled" && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          Cancelled
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 mt-1">
                      {task.description}
                    </p>

                    {/* Category + District */}
                    <div className="flex items-center gap-3 mt-3 text-sm">
                      <span className="bg-gray-200 px-3 py-1 rounded-full">
                        {task.category}
                      </span>
                      <span className="text-gray-600">
                        {task.district}
                      </span>
                    </div>

                    {/* Skills */}
                    {task.skills && task.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {task.skills.map((skill, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                            {skill.skill_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(task)}
                      className="flex items-center gap-1 border px-3 py-1 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    {task.status === "active" && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                      >
                        <XCircle size={16} />
                        Close
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Volunteers */}
                <div className="mt-4 text-sm text-gray-600">
                  {task.filled_quota}/{task.quota} volunteers
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-indigo-600 h-3 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="text-right text-sm text-gray-500 mt-1">
                  {Math.round(progress)}%
                </div>

                {/* Dates */}
                <div className="text-sm text-gray-500 mt-3">
                  {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          task={editingTask}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}