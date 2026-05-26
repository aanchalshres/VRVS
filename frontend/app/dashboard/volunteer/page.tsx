"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  district: string;
  quota: number;
  skills: string[];
  isEmergency: boolean;
  volunteers: number;
}

export default function VolunteerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(
      stored.map((task: any) => ({
        ...task,
        volunteers: task.volunteers ?? task.filled_quota ?? 0,
        isEmergency: task.isEmergency ?? task.is_emergency ?? false,
        skills: Array.isArray(task.skills)
          ? task.skills.map((skill: any) => (typeof skill === "string" ? skill : skill.skill_name))
          : [],
      }))
    );
  }, []);

  // 👉 Redirect to apply page
  const handleApply = (task: Task) => {
    localStorage.setItem("selectedTask", JSON.stringify(task));
    router.push(`/dashboard/apply/${task.id}`);
  };

  // 🧠 FILTER LOGIC
  const filteredTasks = tasks.filter((task) => {
    const matchSearch =
      task.title.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === "all" || task.category === categoryFilter;

    const matchDistrict =
      districtFilter === "all" || task.district === districtFilter;

    return matchSearch && matchCategory && matchDistrict;
  });

  return (
    <DashboardLayout role="volunteer">
      <div className="p-6 space-y-6 bg-[#F0F1F3] min-h-screen">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Volunteer Opportunities
          </h1>
          <p className="text-[#6B7280]">
            Browse and apply to tasks.
          </p>
        </div>

        {/* 🔍 FILTERS */}
        <div className="flex gap-2 items-center">

          <input
            type="text"
            placeholder="Search by NGO / Task title..."
            className="p-1.25 border rounded-md w-250"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 border rounded-md w-56"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Disaster">Disaster</option>
            <option value="Environment">Environment</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Social Welfare">Social Welfare</option>
            <option value="Technology">Technology</option>
            <option value="Community">Community</option>
          </select>

          <select
            className="p-2 border rounded-md w-56"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
            <option value="Bhaktapur">Bhaktapur</option>
            <option value="Pokhara">Pokhara</option>
            <option value="Chitwan">Chitwan</option>
            <option value="Biratnagar">Biratnagar</option>
            <option value="Dharan">Dharan</option>
            <option value="Hetauda">Hetauda</option>
          </select>
        </div>

        {/* TASK LIST */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredTasks.length === 0 && (
            <p className="text-[#6B7280]">No tasks found.</p>
          )}

          {filteredTasks.map((task) => {
            const remaining = task.quota - task.volunteers;

            return (
              <Card key={task.id} className="bg-white border rounded-xl">
                <CardContent className="p-5 space-y-3">

                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-[#111827]">
                      {task.title}
                    </h2>

                    {task.isEmergency && (
                      <Badge className="bg-red-500 text-white">
                        🚨 Emergency
                      </Badge>
                    )}
                  </div>

                  <Badge className="bg-[#F0F1F3] text-[#111827]">
                    {task.category}
                  </Badge>

                  <p className="text-sm text-[#6B7280]">
                    📍 {task.district}
                  </p>

                  <p className="text-sm text-[#6B7280]">
                    👥 {task.volunteers}/{task.quota}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {task.skills.map((skill) => (
                      <Badge key={skill} className="bg-[#F0F1F3] text-[#111827]">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="h-2 bg-[#F0F1F3] rounded-full">
                    <div
                      className="h-2 bg-[#4F46C8] rounded-full"
                      style={{
                        width: `${(task.volunteers / task.quota) * 100}%`,
                      }}
                    />
                  </div>

                  <Button
                    onClick={() => handleApply(task)}
                    disabled={remaining === 0}
                    className={`w-full ${
                      remaining === 0
                        ? "bg-gray-400"
                        : task.isEmergency
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-[#4F46C8] hover:bg-[#3f3db5]"
                    } text-white`}
                  >
                    {remaining === 0 ? "Full" : "Apply"}
                  </Button>

                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}