"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Megaphone,
  AlarmClock,
  MessageCircle,
  Inbox,
  Tag,
  Clock,
  Check,
} from "lucide-react";

// ---------- Types ----------

type NotificationType =
  | "volunteer_applied"
  | "application_approved"
  | "application_rejected"
  | "new_opportunity"
  | "reminder"
  | "message";

type ApplicationStatus = "pending" | "approved" | "rejected";

interface NotificationMeta {
  volunteer_name?: string;
  task_id?: number;
  task_title?: string;
  application_status?: ApplicationStatus;
  // Links this notification back to the exact row in `opportunity_applications`
  // so approving/declining here updates the same record the NGO Applications
  // table and the volunteer's My Applications page read from.
  application_id?: number;
}

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  meta?: NotificationMeta;
}

interface Task {
  id: number;
  title?: string;
  volunteers_needed: number;
  volunteers_joined?: number;
  [key: string]: unknown;
}

interface StoredApplication {
  id: number;
  opportunity_id: number;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  reviewed_by: number | null;
  reviewed_at: string | null;
  updated_at: string;
  [key: string]: unknown;
}

const STORAGE_KEY = "ngo_notifications";
const APPLICATIONS_KEY = "opportunity_applications";

// ---------- Public helper ----------
// Call this from the volunteer-facing "Apply" flow whenever a volunteer
// applies to a task, so the NGO sees it show up here in real time.
// e.g. pushApplicationNotification(task.id, task.title, "Sita Gurung", application.id)
export function pushApplicationNotification(
  taskId: number,
  taskTitle: string,
  volunteerName: string,
  applicationId?: number
) {
  if (typeof window === "undefined") return;

  const existing: Notification[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const notification: Notification = {
    id: Date.now(),
    user_id: 1,
    title: "New volunteer application",
    message: `${volunteerName} applied to "${taskTitle}".`,
    type: "volunteer_applied",
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meta: {
      volunteer_name: volunteerName,
      task_id: taskId,
      task_title: taskTitle,
      application_status: "pending",
      application_id: applicationId,
    },
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([notification, ...existing])
  );
  window.dispatchEvent(new Event("notifications:updated"));
}

// ---------- Presentation helpers ----------

const typeIcon: Record<NotificationType, React.ElementType> = {
  volunteer_applied: UserPlus,
  application_approved: CheckCircle2,
  application_rejected: XCircle,
  new_opportunity: Megaphone,
  reminder: AlarmClock,
  message: MessageCircle,
};

const typeIconColor: Record<NotificationType, string> = {
  volunteer_applied: "text-[#4F46C8]",
  application_approved: "text-[#15803D]",
  application_rejected: "text-[#B91C1C]",
  new_opportunity: "text-[#7683D6]",
  reminder: "text-[#B45309]",
  message: "text-[#6B7280]",
};

const typeLabel: Record<NotificationType, string> = {
  volunteer_applied: "New application",
  application_approved: "Approved",
  application_rejected: "Rejected",
  new_opportunity: "New opportunity",
  reminder: "Reminder",
  message: "Message",
};

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return days === 1 ? "yesterday" : `${days} days ago`;
  if (hours > 0) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  if (minutes > 0) return minutes === 1 ? "a minute ago" : `${minutes} minutes ago`;
  return "just now";
}

type FilterKey = "all" | "unread" | "applications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  const fetchNotifications = useCallback(async () => {
    try {
      /*
      Laravel API Integration

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      setNotifications(data.data);
      */

      const stored = localStorage.getItem(STORAGE_KEY);
      setNotifications(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Refresh the instant a volunteer submits a new application, whether
    // that happened in this tab or another (e.g. Apply page open elsewhere).
    const handleUpdate = () => fetchNotifications();
    window.addEventListener("notifications:updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("notifications:updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchNotifications]);

  const persist = (updated: Notification[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNotifications(updated);
  };

  const markAsRead = async (id: number) => {
    try {
      /*
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`,
        { method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      */

      const updated = notifications.map((n) =>
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      );
      persist(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      /*
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`,
        { method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      */

      const updated = notifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      }));
      persist(updated);
    } catch (error) {
      console.error(error);
    }
  };

  // Approving/rejecting an application also updates:
  //  - the task's quota in ngo_tasks
  //  - the actual row in opportunity_applications, so the NGO Applications
  //    table and the volunteer's My Applications page reflect it too.
  const respondToApplication = (notification: Notification, decision: ApplicationStatus) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id
        ? {
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
            meta: { ...n.meta, application_status: decision },
          }
        : n
    );
    persist(updatedNotifications);

    const applicationId = notification.meta?.application_id;
    const taskId = notification.meta?.task_id;

    if (applicationId) {
      const storedApps: StoredApplication[] = JSON.parse(
        localStorage.getItem(APPLICATIONS_KEY) || "[]"
      );
      const updatedApps = storedApps.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: decision,
              reviewed_by: 999, // replace with actual NGO user ID from context
              reviewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : app
      );
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updatedApps));
      window.dispatchEvent(new Event("applications:updated"));
    }

    if (decision === "approved" && taskId) {
      const tasks: Task[] = JSON.parse(localStorage.getItem("ngo_tasks") || "[]");
      const updatedTasks = tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              volunteers_joined: Math.min(
                t.volunteers_needed,
                (t.volunteers_joined ?? 0) + 1
              ),
            }
          : t
      );
      localStorage.setItem("ngo_tasks", JSON.stringify(updatedTasks));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const applicationCount = notifications.filter(
    (n) => n.type === "volunteer_applied" && n.meta?.application_status === "pending"
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") return !n.is_read;
      if (filter === "applications") return n.type === "volunteer_applied";
      return true;
    });
  }, [notifications, filter]);

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "applications", label: "Applications", count: applicationCount },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="h-9 w-48 bg-[#CACDD3]/60 rounded animate-pulse"></div>
              <div className="h-5 w-56 bg-[#CACDD3]/60 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="h-12 w-40 bg-[#CACDD3]/60 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#CACDD3] p-5 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#CACDD3] rounded-full animate-pulse"></div>
                      <div className="h-6 w-48 bg-[#CACDD3]/60 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-full bg-[#CACDD3]/60 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-[#CACDD3]/60 rounded animate-pulse"></div>
                    <div className="flex gap-4 mt-3">
                      <div className="h-4 w-20 bg-[#CACDD3]/60 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-[#CACDD3]/60 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-10 w-28 bg-[#CACDD3]/60 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
              Notifications
            </h1>
            <p className="text-[#6B7280] mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#4F46C8] text-white text-sm font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
              {unreadCount === 1 ? "unread notification" : "unread notifications"}
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="bg-[#4F46C8] hover:bg-[#4338CA] text-white px-5 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="h-4 w-4" /> Mark All As Read
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {filterTabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
                  active
                    ? "bg-[#4F46C8] text-white border-[#4F46C8]"
                    : "bg-white text-[#6B7280] border-[#CACDD3] hover:border-[#7683D6]"
                }`}
              >
                {tab.label}
                <span className={active ? "text-white/80 ml-1.5" : "text-[#6B7280]/70 ml-1.5"}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications list */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-[#F0F1F3] flex items-center justify-center">
              <Inbox className="h-7 w-7 text-[#6B7280]" />
            </div>
            <h3 className="text-xl font-semibold text-[#111827]">
              Nothing here
            </h3>
            <p className="text-[#6B7280] mt-2">
              You're all caught up! We'll let you know when something new arrives.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const isUnread = !notification.is_read;
              const isApplication = notification.type === "volunteer_applied";
              const status = notification.meta?.application_status;
              const Icon = typeIcon[notification.type];

              return (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
                    isUnread
                      ? "bg-[#F8F9FF] border-l-4 border-l-[#4F46C8] border-[#CACDD3]"
                      : "bg-white border-[#CACDD3]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#4F46C8] shrink-0" />
                        )}
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F1F3] shrink-0 ${typeIconColor[notification.type]}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <h2 className="text-lg font-semibold text-[#111827]">
                          {notification.title}
                        </h2>

                        {isApplication && status && status !== "pending" && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              status === "approved"
                                ? "bg-[#15803D]/10 text-[#15803D]"
                                : "bg-[#B91C1C]/10 text-[#B91C1C]"
                            }`}
                          >
                            {status === "approved" ? "Approved" : "Declined"}
                          </span>
                        )}
                      </div>

                      <p className="text-[#6B7280] mt-2 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5" /> {typeLabel[notification.type]}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {timeAgo(notification.created_at)}
                        </span>
                        {notification.read_at && (
                          <span className="flex items-center gap-1.5 text-[#15803D]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Read
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      {isApplication && status === "pending" ? (
                        <>
                          <button
                            onClick={() => respondToApplication(notification, "approved")}
                            className="bg-[#4F46C8] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg transition flex items-center gap-1.5 text-sm font-medium"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => respondToApplication(notification, "rejected")}
                            className="bg-white border border-[#CACDD3] hover:border-[#B91C1C] hover:text-[#B91C1C] text-[#6B7280] px-4 py-2 rounded-lg transition flex items-center gap-1.5 text-sm font-medium"
                          >
                            <XCircle className="h-4 w-4" /> Decline
                          </button>
                        </>
                      ) : (
                        isUnread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="bg-[#7683D6] hover:bg-[#6674D0] text-white px-4 py-2 rounded-lg h-fit transition flex items-center gap-1.5 text-sm font-medium"
                          >
                            <Check className="h-4 w-4" /> Mark Read
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}