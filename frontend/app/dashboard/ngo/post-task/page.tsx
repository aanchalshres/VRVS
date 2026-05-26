"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { createTask } from "@/app/lib/taskService";

const skillOptions = [
  "First Aid", "Medical", "Logistics", "Construction", "Teaching",
  "IT", "Translation", "Driving", "Swimming", "Communication",
  "Cooking", "Counseling", "Photography", "Gardening", "Painting",
];

const categoryOptions = [
  "Emergency", "Health", "Education", "Environment", "Infrastructure",
  "Community", "Disaster Relief", "Technology", "Social Welfare",
];

const districtOptions = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Gorkha",
  "Chitwan", "Morang", "Sunsari", "Kaski", "Rupandehi",
  "Jhapa", "Makwanpur", "Parsa", "Bara", "Dhanusha",
  "Kailali", "Banke", "Surkhet", "Dang", "Palpa",
];

const CreateOpportunity: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [quota, setQuota] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!description.trim()) {
      toast({ title: "Validation Error", description: "Description is required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!category) {
      toast({ title: "Validation Error", description: "Please select a category.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!district) {
      toast({ title: "Validation Error", description: "Please select a district.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!quota || Number(quota) <= 0) {
      toast({ title: "Validation Error", description: "Quota must be a positive number.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!startDate) {
      toast({ title: "Validation Error", description: "Please select a start date.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!endDate) {
      toast({ title: "Validation Error", description: "Please select an end date.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast({ title: "Validation Error", description: "End date must be after start date.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (selectedSkills.length === 0) {
      toast({ title: "Validation Error", description: "Select at least one skill.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      await createTask({
        title,
        description,
        category,
        district,
        quota: Number(quota),
        start_date: startDate,
        end_date: endDate,
        skills: selectedSkills,
        is_emergency: isEmergency,
      });

      toast({ title: "Task Created!", description: `"${title}" posted successfully.` });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setDistrict("");
      setQuota("");
      setStartDate("");
      setEndDate("");
      setSelectedSkills([]);
      setIsEmergency(false);

      setTimeout(() => router.push("/dashboard/ngo/tasks"), 1000);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create task. Please try again.";
      
      // Check if it's a verification error (not an app error, just a business rule)
      if (errorMessage.includes("verified")) {
        toast({
          title: "Not Eligible",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.error("Error creating task:", error);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="organization">
      <div className="mx-auto max-w-2xl space-y-6 bg-[#F0F1F3] px-4 rounded-xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#111827]">Post New Task</h1>
            <p className="text-[#6B7280]">Create a volunteer opportunity for your organization.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => router.back()} className="gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Card */}
        <Card className="bg-white border border-[#CACDD3]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-[#111827]">Title <span className="text-red-500">*</span></Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Community Health Camp"
                  className="border-[#CACDD3] bg-white text-[#111827]"
                />
              </div>

              {/* Category + District */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-white border-[#CACDD3]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>District <span className="text-red-500">*</span></Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="bg-white border-[#CACDD3]">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {districtOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quota */}
              <div className="space-y-2">
                <Label>Volunteer Quota <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="bg-white border-[#CACDD3]"
                  min={1}
                />
              </div>

              {/* Start + End Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border-[#CACDD3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border-[#CACDD3]"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills Required <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`cursor-pointer select-none ${
                        selectedSkills.includes(skill)
                          ? "bg-[#4F46C8] text-white hover:bg-[#4338CA]"
                          : "bg-white border border-[#CACDD3] text-[#111827] hover:bg-gray-50"
                      }`}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description <span className="text-red-500">*</span></Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task, responsibilities, and requirements..."
                  className="bg-white border-[#CACDD3] min-h-25"
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsEmergency(false)}
                    className={!isEmergency ? "bg-[#4F46C8] text-white hover:bg-[#3f37a0]" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                  >
                    Regular
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsEmergency(true)}
                    className={isEmergency ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                  >
                    🚨 Emergency
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#4F46C8] text-white hover:bg-[#3f37a0] active:bg-[#2d2670] disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Task"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOpportunity;