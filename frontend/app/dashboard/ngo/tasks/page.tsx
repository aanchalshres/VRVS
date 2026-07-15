"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  MapPin,
  Users,
  AlertTriangle,
  Calendar,
  Search,
  Inbox,
  Bell,
  Plus,
} from "lucide-react";

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

interface Application {
  id: number;
  task_id: number;
  volunteer_name: string;
  status: "pending" | "accepted" | "rejected";
  applied_at: string;
}

type StatusFilter = "all" | Task["status"];

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadTasks = useCallback(() => {
    setTasks(JSON.parse(localStorage.getItem("ngo_tasks") || "[]"));
  }, []);

  const loadApplications = useCallback(() => {
    setApplications(JSON.parse(localStorage.getItem("ngo_applications") || "[]"));
  }, []);

  useEffect(() => {
    loadTasks();
    loadApplications();
    setLoaded(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ngo_tasks") loadTasks();
      if (e.key === "ngo_applications") loadApplications();
    };
    // Dispatched from the volunteer Apply page and from this page's
    // own close/delete flows so everything stays in sync live.
    const onTasksUpdated = () => loadTasks();
    const onAppsUpdated = () => loadApplications();
    const onFocus = () => {
      loadTasks();
      loadApplications();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("tasks:updated", onTasksUpdated);
    window.addEventListener("applications:updated", onAppsUpdated);
    window.addEventListener("focus", onFocus);

    const interval = setInterval(() => {
      loadTasks();
      loadApplications();
    }, 5000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tasks:updated", onTasksUpdated);
      window.removeEventListener("applications:updated", onAppsUpdated);
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [loadTasks, loadApplications]);

  const applicationStats = useMemo(() => {
    const map = new Map<number, { total: number; pending: number }>();
    for (const app of applications) {
      const entry = map.get(app.task_id) || { total: 0, pending: 0 };
      entry.total += 1;
      if (app.status === "pending") entry.pending += 1;
      map.set(app.task_id, entry);
    }
    return map;
  }, [applications]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => statusFilter === "all" || t.status === statusFilter)
      .filter((t) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          (t.location || "").toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
  }, [tasks, statusFilter, search]);

  const badgeColor = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700";
      case "ongoing":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const urgencyColor = (level: Task["urgency_level"]) => {
    switch (level) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      default:
        return "text-[#6B7280]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Volunteer Tasks</h1>
            <p className="text-[#6B7280] mt-1">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/ngo/post-task")}
            className="flex items-center gap-2 bg-[#4F46C8] hover:bg-[#3f39a8] transition-colors text-white px-5 py-2.5 rounded-lg font-medium shadow-sm"
          >
            <Plus size={18} />
            Create Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#CACDD3] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.value === "all" ? tasks.length : tasks.filter((t) => t.status === tab.value).length;
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#4F46C8] text-white"
                      : "bg-[#B9C0D4]/30 text-[#111827] hover:bg-[#B9C0D4]/50"
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or location..."
              className="pl-9 pr-3 py-2 border border-[#CACDD3] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#7683D6] w-64"
            />
          </div>
        </div>

        {/* Empty states */}
        {loaded && tasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#CACDD3] p-10 text-center">
            <Inbox size={40} className="mx-auto text-[#6B7280] mb-3" />
            <h2 className="text-xl font-semibold text-[#111827] mb-2">No Tasks Found</h2>
            <p className="text-[#6B7280] mb-6">Create your first volunteer task to get started.</p>
            <button
              onClick={() => router.push("/dashboard/ngo/post-task")}
              className="inline-flex items-center gap-2 bg-[#4F46C8] hover:bg-[#3f39a8] transition-colors text-white px-5 py-2.5 rounded-lg font-medium"
            >
              <Plus size={16} />
              Create Task
            </button>
          </div>
        )}

        {loaded && tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#CACDD3] p-10 text-center">
            <Search size={40} className="mx-auto text-[#6B7280] mb-3" />
            <h2 className="text-xl font-semibold text-[#111827] mb-2">No matching tasks</h2>
            <p className="text-[#6B7280]">Try a different search term or filter.</p>
          </div>
        )}

        {/* Task list */}
        <div className="space-y-5">
          {filteredTasks.map((task) => {
            const stats = applicationStats.get(task.id) || { total: 0, pending: 0 };

            return (
              <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-[#CACDD3] p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-bold text-[#111827]">{task.title}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(task.status)}`}
                      >
                        {task.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[#6B7280] mt-2">{task.description}</p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#111827]">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-[#7683D6]" />
                        {task.location || "Remote / Unspecified"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={16} className="text-[#7683D6]" />
                        {task.volunteers_needed} volunteers needed
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium ${urgencyColor(task.urgency_level)}`}>
                        <AlertTriangle size={16} />
                        {task.urgency_level} urgency
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-[#7683D6]" />
                        {new Date(task.start_date).toLocaleDateString()}
                        {task.end_date && ` – ${new Date(task.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Applications indicator */}
                  <button
                    onClick={() => router.push(`/dashboard/ngo/applications?task_id=${task.id}`)}
                    className="relative flex flex-col items-center justify-center bg-[#B9C0D4]/30 hover:bg-[#B9C0D4]/50 transition-colors rounded-xl px-4 py-3 min-w-[110px]"
                  >
                    {stats.pending > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-[#4F46C8] text-white text-[11px] font-bold">
                        {stats.pending}
                      </span>
                    )}
                    <Bell size={18} className="text-[#4F46C8] mb-1" />
                    <span className="text-lg font-bold text-[#111827] leading-none">{stats.total}</span>
                    <span className="text-[11px] text-[#6B7280] mt-1">
                      Application{stats.total !== 1 ? "s" : ""}
                    </span>
                  </button>
                </div>

                {/* Actions — each routes to its own dedicated page */}
                <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-[#CACDD3]">
                  <button
                    onClick={() => router.push(`/dashboard/ngo/tasks/edit/${task.id}`)}
                    className="flex items-center gap-2 bg-[#7683D6] hover:bg-[#5f6cc4] transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <Pencil size={16} />
                    Update
                  </button>

                  {task.status !== "completed" && (
                    <button
                      onClick={() => router.push(`/dashboard/ngo/tasks/close/${task.id}`)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      Close
                    </button>
                  )}

                  <button
                    onClick={() => router.push(`/dashboard/ngo/applications?task_id=${task.id}`)}
                    className="flex items-center gap-2 bg-[#4F46C8] hover:bg-[#3f39a8] transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <Eye size={16} />
                    View Applications
                  </button>

                  <button
                    onClick={() => router.push(`/dashboard/ngo/tasks/delete/${task.id}`)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium ml-auto"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}