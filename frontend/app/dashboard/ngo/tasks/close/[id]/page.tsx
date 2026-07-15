"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, Users, Calendar } from "lucide-react";

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

export default function CloseTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [closing, setClosing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const tasks: Task[] = JSON.parse(localStorage.getItem("ngo_tasks") || "[]");
    const found = tasks.find((t) => t.id === taskId);
    if (!found) {
      setNotFound(true);
      return;
    }
    setTask(found);

    const reference = found.end_date || found.start_date;
    if (reference) {
      const refDate = new Date(reference);
      refDate.setHours(23, 59, 59, 999);
      setIsExpired(refDate.getTime() < Date.now());
    }

    const applications = JSON.parse(localStorage.getItem("ngo_applications") || "[]");
    const pending = applications.filter(
      (a: any) => a.task_id === taskId && a.status === "pending"
    ).length;
    setPendingCount(pending);
  }, [taskId]);

  const handleClose = () => {
    if (!task) return;
    setClosing(true);

    const tasks: Task[] = JSON.parse(localStorage.getItem("ngo_tasks") || "[]");
    const updated = tasks.map((t) => (t.id === task.id ? { ...t, status: "completed" as const } : t));
    localStorage.setItem("ngo_tasks", JSON.stringify(updated));
    window.dispatchEvent(new Event("tasks:updated"));

    setTimeout(() => router.push("/dashboard/ngo/tasks"), 500);
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
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>

          <h1 className="text-xl font-bold text-[#111827] mb-2">Close this task?</h1>
          <p className="text-[#6B7280] mb-6">
            <span className="font-medium text-[#111827]">"{task.title}"</span> will be marked as{" "}
            <span className="font-medium text-[#111827]">completed</span>. It will move out of active
            listings and volunteers will no longer be able to apply.
          </p>

          <div className="bg-[#B9C0D4]/25 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[#111827]">
              <Users size={15} className="text-[#4F46C8]" />
              {task.volunteers_needed} volunteers needed
            </div>
            <div className="flex items-center gap-2 text-[#111827]">
              <Calendar size={15} className="text-[#4F46C8]" />
              {new Date(task.start_date).toLocaleDateString()}
              {task.end_date && ` – ${new Date(task.end_date).toLocaleDateString()}`}
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle size={15} />
                {pendingCount} application{pendingCount !== 1 ? "s" : ""} still pending review
              </div>
            )}
            {isExpired && (
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={15} />
                This task's schedule has already passed
              </div>
            )}
          </div>

          {isExpired && (
            <p className="text-xs text-[#6B7280] mb-6 -mt-2">
              If this was posted with the wrong dates rather than actually finished,{" "}
              <button
                onClick={() => router.push(`/dashboard/ngo/tasks/edit/${task.id}`)}
                className="text-[#4F46C8] font-medium hover:underline"
              >
                update it instead
              </button>
              .
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => router.push("/dashboard/ngo/tasks")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#111827] bg-[#B9C0D4]/30 hover:bg-[#B9C0D4]/50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleClose}
              disabled={closing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              {closing ? "Closing..." : "Close Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}