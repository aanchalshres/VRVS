'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { isVolunteerVerified } from 'app/lib/verification';
import {
  MapPin,
  Users,
  AlertTriangle,
  FolderOpen,
  ArrowLeft,
  Send,
  Loader2,
  FileText,
  Sparkles,
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Briefcase,
  Award,
  Clock,
  ShieldCheck,
  ShieldAlert,
  HeartPulse,
  Car,
  CheckSquare,
  Square,
  UserCircle2,
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  location?: string;
  volunteers_needed?: number;
  urgency_level?: string;
  type?: string;
  selectedSkills?: string[];
  created_by?: number | string;
  ngo_user_id?: number | string;
  user_id?: number | string;
}

const URGENCY_STYLES: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-[#6B7280]',
};

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Experienced'];

const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Morning', 'Afternoon', 'Evening'];

const SKILL_OPTIONS = [
  'First Aid',
  'Teaching',
  'Driving',
  'Communication',
  'Cooking',
  'Crowd Management',
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  age: string;
  gender: string;
  emergencyContact: string;
  emergencyPhone: string;
  occupation: string;
  experienceLevel: string;
  availability: string[];
  skills: string[];
  motivation: string;
  previousExperience: string;
  medicalConditions: string;
  hasTransport: string;
  agreedToTerms: boolean;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  age: '',
  gender: '',
  emergencyContact: '',
  emergencyPhone: '',
  occupation: '',
  experienceLevel: '',
  availability: [],
  skills: [],
  motivation: '',
  previousExperience: '',
  medicalConditions: '',
  hasTransport: '',
  agreedToTerms: false,
};

// Pulls the NGO user_id off a task, trying every field name the
// task-creation flow might have used. Coerces to a number so it still
// works whether the id was stored as a number or a numeric string.
// Returns null only if no usable value is present at all, so the
// notification write can be safely skipped rather than mis-targeted.
function resolveNgoUserId(task: Task): number | null {
  const candidate = task.created_by ?? task.ngo_user_id ?? task.user_id;
  if (candidate === undefined || candidate === null || candidate === '') return null;
  const num = Number(candidate);
  return Number.isNaN(num) ? null : num;
}

export default function ApplyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const taskId = params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  // --- Identity verification (email + phone) ---
  // This app identifies the volunteer via `volunteer_profile_id` in
  // localStorage rather than an auth context, so verification is checked
  // against that id.
  const [volunteerProfileId, setVolunteerProfileId] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const idStr = localStorage.getItem('volunteer_profile_id');
    const id = idStr ? Number(idStr) : null;
    setVolunteerProfileId(id);
    setVerified(isVolunteerVerified(id));

    const refresh = () => setVerified(isVolunteerVerified(id));
    window.addEventListener('verification:updated', refresh);
    return () => window.removeEventListener('verification:updated', refresh);
  }, []);

  const goVerify = () => {
    router.push(`/dashboard/volunteer/verify?next=${encodeURIComponent(pathname)}`);
  };

  // Load the selected task from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('selectedTask');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (String(parsed.id) === String(taskId)) {
        setTask(parsed);
      } else {
        const allTasks = JSON.parse(localStorage.getItem('ngo_tasks') || '[]');
        const found = allTasks.find((t: any) => String(t.id) === String(taskId));
        if (found) setTask(found);
        else setError('Task not found');
      }
    } else {
      const allTasks = JSON.parse(localStorage.getItem('ngo_tasks') || '[]');
      const found = allTasks.find((t: any) => String(t.id) === String(taskId));
      if (found) setTask(found);
      else setError('No task selected');
    }
  }, [taskId]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFromArray = (field: 'availability' | 'skills', value: string) => {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setFormError('');

    // --- Verification guard: this is the actual enforcement point ---
    if (!isVolunteerVerified(volunteerProfileId)) {
      goVerify();
      return;
    }

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Please fill in your full name, email, and phone number.');
      return;
    }
    if (!form.agreedToTerms) {
      setFormError('Please confirm that the information provided is correct.');
      return;
    }

    setLoading(true);
    setError('');

    const appliedAt = new Date().toISOString();

    const applicant = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      emergencyContact: form.emergencyContact.trim() || null,
      emergencyPhone: form.emergencyPhone.trim() || null,
      occupation: form.occupation.trim() || null,
      experienceLevel: form.experienceLevel || null,
      availability: form.availability,
      skills: form.skills,
      motivation: form.motivation.trim() || null,
      previousExperience: form.previousExperience.trim() || null,
      medicalConditions: form.medicalConditions.trim() || null,
      hasTransport: form.hasTransport || null,
    };

    const newApplication = {
      id: Date.now(),
      opportunity_id: task.id,
      volunteer_profile_id: volunteerProfileId,
      status: 'pending' as const,
      applied_at: appliedAt,
      reviewed_by: null,
      reviewed_at: null,
      applicant,
      created_at: appliedAt,
      updated_at: appliedAt,
    };

    try {
      // 1. Volunteer-facing record (used on /dashboard/volunteer/applications)
      const existing = JSON.parse(localStorage.getItem('opportunity_applications') || '[]');
      localStorage.setItem('opportunity_applications', JSON.stringify([newApplication, ...existing]));

      // 2. NGO-facing record (used on /dashboard/ngo/applications).
      // Carries the same id so the two records can be kept in sync later,
      // plus the full applicant details so the NGO can review the submission.
      const volunteerName = form.fullName.trim() || `Volunteer #${volunteerProfileId ?? 'unknown'}`;
      const ngoExisting = JSON.parse(localStorage.getItem('ngo_applications') || '[]');
      const ngoRecord = {
        id: newApplication.id,
        task_id: task.id,
        volunteer_name: volunteerName,
        status: 'pending' as const,
        applied_at: appliedAt,
        applicant,
      };
      localStorage.setItem('ngo_applications', JSON.stringify([ngoRecord, ...ngoExisting]));
      window.dispatchEvent(new Event('applications:updated'));

      // 3. Notification for the NGO, only if we can resolve a recipient.
      const ngoUserId = resolveNgoUserId(task);
      if (ngoUserId !== null) {
        const newNotification = {
          id: newApplication.id + 1,
          user_id: ngoUserId,
          title: 'New volunteer application',
          message: `${volunteerName} applied to "${task.title}".`,
          type: 'volunteer_applied',
          is_read: false,
          read_at: null,
          created_at: appliedAt,
          updated_at: appliedAt,
          meta: {
            volunteer_name: volunteerName,
            task_id: task.id,
            task_title: task.title,
            application_status: 'pending',
            application_id: newApplication.id,
          },
        };
        const notifExisting = JSON.parse(localStorage.getItem('ngo_notifications') || '[]');
        localStorage.setItem('ngo_notifications', JSON.stringify([newNotification, ...notifExisting]));
        window.dispatchEvent(new Event('notifications:updated'));
      } else {
        console.warn(
          `ApplyPage: could not resolve NGO user_id for task ${task.id}; notification not created.`
        );
      }

      router.push('/dashboard/volunteer/applications');
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#CACDD3] text-center max-w-sm">
          <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium text-lg mb-1">{error}</p>
          <p className="text-[#6B7280] text-sm mb-6">
            The task may have been removed or the link is invalid.
          </p>
          <button
            onClick={() => router.push('/dashboard/volunteer/tasks')}
            className="flex items-center gap-2 justify-center w-full bg-[#4F46C8] hover:bg-[#3f39a8] transition-colors text-white px-6 py-2.5 rounded-lg font-medium"
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-6">
        <div className="flex items-center gap-2 text-[#6B7280]">
          <Loader2 size={18} className="animate-spin" />
          Loading task...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/volunteer/tasks')}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Tasks
        </button>

        {/* Verification banner */}
        {!verified && (
          <div className="flex items-start gap-2.5 text-sm text-[#B91C1C] bg-[#B91C1C]/5 border border-[#B91C1C]/20 rounded-xl px-4 py-3.5 mb-6">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>
              You need to verify your email and phone number before applying.{' '}
              <button type="button" onClick={goVerify} className="underline font-semibold">
                Verify now
              </button>
            </span>
          </div>
        )}

        {/* Task summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#CACDD3] p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">{task.title}</h1>
          <p className="text-[#6B7280] mt-2">{task.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2.5 bg-[#B9C0D4]/25 rounded-lg px-3 py-2.5">
              <MapPin size={17} className="text-[#4F46C8] shrink-0" />
              <div>
                <p className="text-[#6B7280] text-xs">Location</p>
                <p className="font-medium text-[#111827]">{task.location || 'Remote'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-[#B9C0D4]/25 rounded-lg px-3 py-2.5">
              <Users size={17} className="text-[#4F46C8] shrink-0" />
              <div>
                <p className="text-[#6B7280] text-xs">Volunteers Needed</p>
                <p className="font-medium text-[#111827]">{task.volunteers_needed || 1}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-[#B9C0D4]/25 rounded-lg px-3 py-2.5">
              <AlertTriangle
                size={17}
                className={`shrink-0 ${URGENCY_STYLES[(task.urgency_level || 'low').toLowerCase()] || 'text-[#6B7280]'}`}
              />
              <div>
                <p className="text-[#6B7280] text-xs">Urgency</p>
                <p className="font-medium text-[#111827] capitalize">{task.urgency_level || 'Low'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-[#B9C0D4]/25 rounded-lg px-3 py-2.5">
              <FolderOpen size={17} className="text-[#4F46C8] shrink-0" />
              <div>
                <p className="text-[#6B7280] text-xs">Type</p>
                <p className="font-medium text-[#111827] capitalize">{task.type || 'General'}</p>
              </div>
            </div>
          </div>

          {task.selectedSkills && task.selectedSkills.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-[#6B7280] text-sm mb-2">
                <Sparkles size={14} />
                Required skills
              </div>
              <div className="flex flex-wrap gap-2">
                {task.selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-[#4F46C8] text-white text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Application form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Your Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#CACDD3] p-6">
            <div className="flex items-center gap-2 mb-5">
              <User size={20} className="text-[#4F46C8]" />
              <h2 className="text-xl font-semibold text-[#111827]">Your Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" required icon={User}>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </Field>

              <Field label="Email" required icon={Mail}>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="jane@example.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Phone Number" required icon={Phone}>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className={inputClass}
                />
              </Field>

              <Field label="Address" icon={Home}>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Street, City"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* Volunteer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#CACDD3] p-6">
            <div className="flex items-center gap-2 mb-5">
              <UserCircle2 size={20} className="text-[#4F46C8]" />
              <h2 className="text-xl font-semibold text-[#111827]">Volunteer Details</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Age" icon={Calendar}>
                <input
                  type="number"
                  min={0}
                  value={form.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="25"
                  className={inputClass}
                />
              </Field>

              <Field label="Gender" icon={User}>
                <select
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </Field>

              <Field label="Emergency Contact" icon={User}>
                <input
                  type="text"
                  value={form.emergencyContact}
                  onChange={(e) => updateField('emergencyContact', e.target.value)}
                  placeholder="Contact person's name"
                  className={inputClass}
                />
              </Field>

              <Field label="Emergency Phone" icon={Phone}>
                <input
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => updateField('emergencyPhone', e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className={inputClass}
                />
              </Field>

              <Field label="Occupation" icon={Briefcase}>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  placeholder="Student, Engineer, etc."
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Experience Level */}
            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#111827] mb-2.5">
                <Award size={15} className="text-[#4F46C8]" />
                Experience Level
              </div>
              <div className="flex flex-wrap gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <label
                    key={level}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                      form.experienceLevel === level
                        ? 'border-[#4F46C8] bg-[#4F46C8]/5 text-[#4F46C8] font-medium'
                        : 'border-[#CACDD3] text-[#111827] hover:bg-[#B9C0D4]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level}
                      checked={form.experienceLevel === level}
                      onChange={(e) => updateField('experienceLevel', e.target.value)}
                      className="accent-[#4F46C8]"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#111827] mb-2.5">
                <Clock size={15} className="text-[#4F46C8]" />
                Availability
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map((option) => {
                  const active = form.availability.includes(option);
                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => toggleFromArray('availability', option)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm transition-colors ${
                        active
                          ? 'border-[#4F46C8] bg-[#4F46C8]/5 text-[#4F46C8] font-medium'
                          : 'border-[#CACDD3] text-[#111827] hover:bg-[#B9C0D4]/20'
                      }`}
                    >
                      {active ? <CheckSquare size={15} /> : <Square size={15} />}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#CACDD3] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={20} className="text-[#4F46C8]" />
              <h2 className="text-xl font-semibold text-[#111827]">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const active = form.skills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleFromArray('skills', skill)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm transition-colors ${
                      active
                        ? 'border-[#4F46C8] bg-[#4F46C8] text-white font-medium'
                        : 'border-[#CACDD3] text-[#111827] hover:bg-[#B9C0D4]/20'
                    }`}
                  >
                    {active ? <CheckSquare size={15} /> : <Square size={15} />}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motivation & Experience */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#CACDD3] p-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-[#4F46C8]" />
              <h2 className="text-xl font-semibold text-[#111827]">Tell Us More</h2>
            </div>

            <Field label="Why do you want to volunteer?">
              <textarea
                rows={4}
                value={form.motivation}
                onChange={(e) => updateField('motivation', e.target.value)}
                placeholder="Share your motivation for joining this task..."
                className={inputClass}
              />
            </Field>

            <Field label="Previous Volunteer Experience">
              <textarea
                rows={4}
                value={form.previousExperience}
                onChange={(e) => updateField('previousExperience', e.target.value)}
                placeholder="Describe any relevant past volunteer work..."
                className={inputClass}
              />
            </Field>

            <Field label="Medical Conditions" icon={HeartPulse}>
              <textarea
                rows={3}
                value={form.medicalConditions}
                onChange={(e) => updateField('medicalConditions', e.target.value)}
                placeholder="List any conditions we should be aware of (optional)..."
                className={inputClass}
              />
            </Field>

            {/* Own transportation */}
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#111827] mb-2.5">
                <Car size={15} className="text-[#4F46C8]" />
                Can you bring your own transportation?
              </div>
              <div className="flex gap-3">
                {['Yes', 'No'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                      form.hasTransport === option
                        ? 'border-[#4F46C8] bg-[#4F46C8]/5 text-[#4F46C8] font-medium'
                        : 'border-[#CACDD3] text-[#111827] hover:bg-[#B9C0D4]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasTransport"
                      value={option}
                      checked={form.hasTransport === option}
                      onChange={(e) => updateField('hasTransport', e.target.value)}
                      className="accent-[#4F46C8]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#CACDD3] p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreedToTerms}
                onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                className="mt-0.5 accent-[#4F46C8] w-4 h-4"
              />
              <span className="flex items-center gap-1.5 text-sm text-[#111827]">
                <ShieldCheck size={15} className="text-[#4F46C8] shrink-0" />
                I confirm that the information provided is correct.
              </span>
            </label>
          </div>

          {(formError || error) && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <AlertTriangle size={16} />
              {formError || error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white border border-[#CACDD3] text-[#111827] rounded-xl hover:bg-[#B9C0D4]/25 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                verified
                  ? 'bg-[#4F46C8] hover:bg-[#3f39a8] text-white'
                  : 'bg-[#CACDD3] text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : verified ? (
                <>
                  <Send size={18} />
                  Submit Application
                </>
              ) : (
                <>
                  <ShieldAlert size={18} />
                  Verify Identity to Apply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 border border-[#CACDD3] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#7683D6] focus:border-transparent transition bg-white';

function Field({
  label,
  required,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#111827] mb-1.5">
        {Icon && <Icon size={14} className="text-[#4F46C8]" />}
        {label}
        {required && <span className="text-[#6B7280] font-normal">*</span>}
      </label>
      {children}
    </div>
  );
}