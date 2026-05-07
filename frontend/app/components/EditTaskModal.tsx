"use client";

import { useState } from "react";
import { useToast } from "@/app/hooks/use-toast";
import { updateTask, Task } from "@/app/lib/taskService";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";

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

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
  onSave: () => void;
}

export default function EditTaskModal({
  isOpen,
  task,
  onClose,
  onSave,
}: EditTaskModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [category, setCategory] = useState(task.category);
  const [district, setDistrict] = useState(task.district);
  const [quota, setQuota] = useState(String(task.quota));
  const [status, setStatus] = useState(task.status);
  const [startDate, setStartDate] = useState(task.start_date.split("T")[0]);
  const [endDate, setEndDate] = useState(task.end_date.split("T")[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    task.skills?.map(s => s.skill_name) || []
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!category) {
      toast({
        title: "Validation Error",
        description: "Please select a category.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!district) {
      toast({
        title: "Validation Error",
        description: "Please select a district.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!quota || Number(quota) <= 0) {
      toast({
        title: "Validation Error",
        description: "Quota must be a positive number.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!startDate) {
      toast({
        title: "Validation Error",
        description: "Please select a start date.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!endDate) {
      toast({
        title: "Validation Error",
        description: "Please select an end date.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (selectedSkills.length === 0) {
      toast({
        title: "Validation Error",
        description: "Select at least one skill.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await updateTask(task.id, {
        title,
        description,
        category,
        district,
        quota: Number(quota),
        start_date: startDate,
        end_date: endDate,
        status,
        skills: selectedSkills,
      });

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[#111827]">
              Title <span className="text-red-500">*</span>
            </Label>
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
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white border-[#CACDD3]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>District *</Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="bg-white border-[#CACDD3]">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {districtOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quota + Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Quota *</Label>
              <Input
                type="number"
                placeholder="Volunteer quota"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="bg-white border-[#CACDD3]"
              />
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white border-[#CACDD3]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date + End Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border-[#CACDD3]"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
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
            <Label>Skills *</Label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <Badge
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`cursor-pointer ${
                    selectedSkills.includes(skill)
                      ? "bg-[#4F46C8] text-white"
                      : "bg-white border"
                  }`}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className="bg-white border-[#CACDD3]"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#4F46C8] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
