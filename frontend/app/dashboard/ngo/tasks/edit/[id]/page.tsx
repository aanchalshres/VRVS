"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertTriangle, CheckCircle2 } from "lucide-react";

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

const URGENCY_OPTIONS: Task["urgency_level"][] = ["low", "medium", "high"];
const STATUS_OPTIONS: Task["status"][] = ["draft", "open", "ongoing", "completed"];

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = Number(params.id);

  const [form, setForm] = useState<Task | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored: Task[] = JSON.parse(localStorage.getItem("ngo_tasks") || "[]");
    const task = stored.find((t) => t.id === taskId);
    if (task) {
      setForm(task);
    } else {
      setNotFound(true);
    }
  }, [taskId]);

  const update = <K extends keyof Task>(key: K, value: Task[K]) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
    setSaved(false);
  };

  const validate = (task: Task) => {
    const next: Record<string, string> = {};
    if (!task.title.trim()) next.title = "Title is required.";
    if (!task.description.trim()) next.description = "Description is required.";
    if (!task.start_date) next.start_date = "Start date is required.";
    if (task.end_date && task.start_date && task.end_date < task.start_date) {
      next.end_date = "End date can't be before the start date.";
    }
    if (!task.volunteers_needed || task.volunteers_needed < 1) {
      next.volunteers_needed = "Must need at least 1 volunteer.";
    }
    return next;
  };

  const handleSave = () => {
    if (!form) return;
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const stored: Task[] = JSON.parse(localStorage.getItem("ngo_tasks") || "[]");
    const updated = stored.map((t) => (t.id === form.id ? form : t));
    localStorage.setItem("ngo_tasks", JSON.stringify(updated));
    window.dispatchEvent(new Event("tasks:updated"));

    setSaved(true);
    setTimeout(() => router.push("/dashboard/ngo/tasks"), 700);
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
            Back to Manage Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-8">
        <p className="text-[#6B7280]">Loading task...</p>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full border rounded-lg px-3.5 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7683D6] ${
      errors[field] ? "border-red-400" : "border-[#CACDD3]"
    }`;

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/dashboard/ngo/tasks")}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Manage Tasks
        </button>

        <div className="bg-white border border-[#CACDD3] rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#111827] mb-1">Edit Task</h1>
          <p className="text-[#6B7280] mb-8">Update the details for this volunteer task.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={inputClass("title")}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className={inputClass("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Location</label>
              <input
                value={form.location || ""}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Remote / Unspecified"
                className={inputClass("location")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  Volunteers Needed
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.volunteers_needed}
                  onChange={(e) => update("volunteers_needed", Number(e.target.value))}
                  className={inputClass("volunteers_needed")}
                />
                {errors.volunteers_needed && (
                  <p className="text-xs text-red-500 mt-1">{errors.volunteers_needed}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  Urgency Level
                </label>
                <select
                  value={form.urgency_level}
                  onChange={(e) => update("urgency_level", e.target.value as Task["urgency_level"])}
                  className={inputClass("urgency_level")}
                >
                  {URGENCY_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u.charAt(0).toUpperCase() + u.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={form.start_date?.slice(0, 10) || ""}
                  onChange={(e) => update("start_date", e.target.value)}
                  className={inputClass("start_date")}
                />
                {errors.start_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={form.end_date?.slice(0, 10) || ""}
                  onChange={(e) => update("end_date", e.target.value || null)}
                  className={inputClass("end_date")}
                />
                {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as Task["status"])}
                className={inputClass("status")}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#CACDD3]">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4F46C8] hover:bg-[#3f39a8] transition-colors text-white px-5 py-2.5 rounded-lg font-medium"
            >
              <Save size={16} />
              Save Changes
            </button>

            <button
              onClick={() => router.push("/dashboard/ngo/tasks")}
              className="px-5 py-2.5 rounded-lg font-medium text-[#111827] bg-[#B9C0D4]/30 hover:bg-[#B9C0D4]/50 transition-colors"
            >
              Discard
            </button>

            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium ml-2">
                <CheckCircle2 size={16} />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}