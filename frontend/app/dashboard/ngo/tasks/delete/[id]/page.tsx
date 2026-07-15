"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  location: string | null;
  volunteers_needed: number;
  start_date: string;
  end_date: string | null;
  urgency_level: "low" | "medium" | "high";
  status: "draft" | "open" | "ongoing" | "completed";
}

export default function DeleteTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    const tasks: Task[] = JSON.parse(localStorage.getItem("ngo_tasks") || "[]");
    const found = tasks.find((t) => t.id === taskId);
    if (!found) {
      setNotFound(true);
      return;
    }
    setTask(found);

    const applications = JSON.parse(localStorage.getItem("ngo_applications") || "[]");
    setApplicationCount(applications.filter((a: any) => a.task_id === taskId).length);
  }, [taskId]);

  const handleDelete = () => {
    if (!task) return;
    setDeleting(true);

    const tasks: Task[] = JSON.parse(localStorage.getItem("ngo_tasks") || "[]");
    const updated = tasks.filter((t) => t.id !== task.id);
    localStorage.setItem("ngo_tasks", JSON.stringify(updated));
    window.dispatchEvent(new Event("tasks:updated"));

    setTimeout(() => router.push("/dashboard/ngo/tasks"), 400);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-8">
        <div className="bg-white border border-[#CACDD3] rounded-2xl shadow-sm p-10 text-center max-w-md">
          <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
          <h1 className="text-xl font-bold text-[#111827] mb-2">Task not found</h1>
          <p className="text-[#6B7280] mb-6">
            This task may have already been deleted or the link is invalid.
          </p>
          <button
            onClick={() => router.push("/dashboard/ngo/tasks")}
            className="bg-[#4F46C8] hover:bg-[#3f39a8] transition-colors text-white px-5 py-2.5 rounded-lg font-medium"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-8">
        <p className="text-[#6B7280]">Loading task...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/dashboard/ngo/tasks")}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Tasks
        </button>

        <div className="bg-white border border-[#CACDD3] rounded-2xl shadow-sm p-8">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 size={22} className="text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-[#111827] mb-2">Delete this task?</h1>
          <p className="text-[#6B7280] mb-6">
            <span className="font-medium text-[#111827]">"{task.title}"</span> will be permanently
            removed. This action cannot be undone.
          </p>

          {applicationCount > 0 && (
            <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3 mb-6">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                This task has {applicationCount} application{applicationCount !== 1 ? "s" : ""} attached.
                Deleting it won't remove those records, but they'll no longer be linked to a visible task.
              </span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => router.push("/dashboard/ngo/tasks")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#111827] bg-[#B9C0D4]/30 hover:bg-[#B9C0D4]/50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Delete Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}