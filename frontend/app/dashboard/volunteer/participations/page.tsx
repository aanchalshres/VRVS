'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/app/lib/api';
import {
  Briefcase, Clock, MapPin, Inbox, AlertCircle,
  Calendar, Building2, Users, LogIn, LogOut,
  CheckCircle2, Timer, ShieldCheck, Camera,
  QrCode, X, Navigation, Loader2,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  CONFIDENCE_LEVEL_COLORS,
  CONFIDENCE_LEVEL_LABELS,
  STATUS_LABELS,
} from '@/app/lib/attendance';
import type { AttendanceLog } from '@/app/lib/attendance';

interface AssignedTaskSkill {
  id: number;
  name: string;
}

interface AssignedTaskCategory {
  id: number;
  name: string;
}

interface AssignedTaskNgoUser {
  name: string;
  email: string;
  phone: string | null;
}

interface AssignedTaskNgo {
  organization_name: string;
  office_location: string | null;
  website: string | null;
  user: AssignedTaskNgoUser;
}

interface AssignedTask {
  id: number;
  task_id: number;
  task: {
    id: number;
    title: string;
    description: string;
    location: string | null;
    city: string | null;
    latitude: string | null;
    longitude: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    required_volunteers: number | null;
    ngo: AssignedTaskNgo | null;
    skills: AssignedTaskSkill[];
    category: AssignedTaskCategory | null;
  } | null;
}

function ConfidenceBadge({ level, score }: { level: string | null; score: number | null }) {
  if (!level) return null;
  const color = CONFIDENCE_LEVEL_COLORS[level] || 'bg-gray-100 text-gray-600';
  const label = CONFIDENCE_LEVEL_LABELS[level] || level;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}
      title={`Score: ${score ?? 'N/A'}`}>
      <ShieldCheck size={11} />
      {label}
    </span>
  );
}

function QrScannerModal({ onScan, onClose }: { onScan: (token: string) => void; onClose: () => void }) {
  const [manualToken, setManualToken] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (mounted) {
              scanner.stop().catch(() => {});
              onScan(decodedText);
            }
          },
          () => {}
        );
        if (mounted) setCameraActive(true);
      } catch {
        if (mounted) setScanError('Camera unavailable. Enter token manually.');
      }
    }
    start();
    return () => {
      mounted = false;
      scannerRef.current?.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <Camera size={20} className="text-[#4F46C8]" />
            Scan QR Code
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div ref={containerRef} id="qr-reader" className="w-full aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden" />

        {scanError && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mb-3">{scanError}</p>
        )}

        <div className="border-t border-[#CACDD3] pt-4">
          <p className="text-xs font-medium text-[#6B7280] mb-2">Or enter token manually</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste QR token here"
              className="flex-1 border border-[#CACDD3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]/30"
            />
            <button
              onClick={() => { if (manualToken.trim()) onScan(manualToken.trim()); }}
              disabled={!manualToken.trim()}
              className="px-4 py-2 bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white text-sm font-medium rounded-lg transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GpsPrompt({ onCapture, onSkip }: { onCapture: () => void; onSkip: () => void }) {
  const [gettingGps, setGettingGps] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!navigator.geolocation) {
      setGettingGps(false);
      setGpsError('GPS not available on this device');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => { onCapture(); },
      (err) => {
        setGettingGps(false);
        setGpsError(`GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onCapture]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
        {gettingGps ? (
          <>
            <Loader2 size={40} className="mx-auto text-[#4F46C8] animate-spin mb-3" />
            <p className="text-[#111827] font-medium mb-1">Getting your location...</p>
            <p className="text-xs text-[#6B7280]">This helps verify your presence at the task site.</p>
          </>
        ) : (
          <>
            <Navigation size={40} className="mx-auto text-amber-500 mb-3" />
            <p className="text-[#111827] font-medium mb-1">{gpsError || 'GPS unavailable'}</p>
            <p className="text-xs text-[#6B7280] mb-4">You can still check in without GPS, but confidence may be lower.</p>
            <button
              onClick={onSkip}
              className="w-full px-4 py-2 bg-[#4F46C8] hover:bg-[#3f39a8] text-white text-sm font-medium rounded-lg transition"
            >
              Continue without GPS
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VolunteerParticipationsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showGpsPrompt, setShowGpsPrompt] = useState(false);
  const [pendingCheckAction, setPendingCheckAction] = useState<{ taskId: number; type: 'check_in' | 'check_out' } | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksRes, attendanceRes, hoursRes] = await Promise.all([
        apiGet<{ data: AssignedTask[] }>('/volunteer/assigned-tasks'),
        apiGet<{ data: AttendanceLog[] }>('/volunteer/attendance/secure-history'),
        apiGet<{ total_hours: number }>('/volunteer/attendance/hours'),
      ]);
      setTasks(tasksRes.data ?? []);
      setAttendanceLogs(attendanceRes.data ?? []);
      setTotalHours(hoursRes.total_hours ?? 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function getServiceLogForTask(taskId: number): AttendanceLog | null {
    const taskLogs = attendanceLogs.filter((l) => l.task_id === taskId);
    if (taskLogs.length === 0) return null;
    return taskLogs.reduce((latest, log) =>
      new Date(log.check_in_time || log.created_at) > new Date(latest.check_in_time || latest.created_at) ? log : latest
    );
  }

  const requestGps = (): Promise<{ latitude: number; longitude: number; accuracy: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleQrScan = async (token: string) => {
    setShowQrScanner(false);
    setQrToken(token);

    if (!pendingCheckAction) return;

    const gps = await requestGps();
    setGpsData(gps);

    const action = pendingCheckAction;
    setPendingCheckAction(null);

    setActionLoading(action.taskId);
    try {
      const deviceInfo = {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
      };
      const lat = gps?.latitude ?? 0;
      const lng = gps?.longitude ?? 0;
      const acc = gps?.accuracy ?? 999;

      if (action.type === 'check_in') {
        await apiPost('/volunteer/attendance/secure-check-in', {
          qr_token: token,
          latitude: lat,
          longitude: lng,
          gps_accuracy: acc,
          device_info: deviceInfo,
        });
        showToast('Check-in successful!', 'success');
      } else {
        const res = await apiPost<{ message: string; data: { hours: number | null } }>('/volunteer/attendance/secure-check-out', {
          qr_token: token,
          latitude: lat,
          longitude: lng,
          gps_accuracy: acc,
          device_info: deviceInfo,
        });
        showToast(`Check-out successful! Hours: ${res.data?.hours ?? 0}`, 'success');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
      setQrToken(null);
      setGpsData(null);
    }
  };

  const handleCheckIn = (taskId: number) => {
    setPendingCheckAction({ taskId, type: 'check_in' });
    setShowQrScanner(true);
  };

  const handleCheckOut = (taskId: number) => {
    setPendingCheckAction({ taskId, type: 'check_out' });
    setShowQrScanner(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium">Failed to load</p>
          <p className="text-sm text-[#6B7280] mt-1">{error}</p>
          <button onClick={loadData} className="mt-4 bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2 rounded-xl font-medium transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      {showQrScanner && (
        <QrScannerModal
          onScan={handleQrScan}
          onClose={() => { setShowQrScanner(false); setPendingCheckAction(null); }}
        />
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">My Participations</h1>
            <p className="text-[#6B7280] text-sm mt-1">
              Check in to your assigned tasks using QR code and GPS verification.
            </p>
          </div>
          {totalHours > 0 && (
            <div className="flex items-center gap-2 bg-white border border-[#CACDD3] rounded-xl px-4 py-2.5">
              <Timer size={18} className="text-[#4F46C8]" />
              <span className="text-sm font-semibold text-[#111827]">{totalHours} hrs</span>
            </div>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#CACDD3] p-10 text-center">
            <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-[#111827] font-medium mb-1">No assigned tasks yet</p>
            <p className="text-[#6B7280] text-sm mb-5">
              Once your applications are accepted, your assigned tasks will appear here.
            </p>
            <button
              onClick={() => router.push('/dashboard/volunteer/tasks')}
              className="bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Browse Tasks
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-10">
              {tasks.map((app) => {
                const task = app.task;
                if (!task) return null;
                const ngo = task.ngo;
                const log = getServiceLogForTask(task.id);
                const isCheckedIn = log?.status === 'active';
                const isCompleted = log?.status === 'completed';

                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-[#CACDD3] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                          <Briefcase size={18} className="text-[#4F46C8]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#111827]">{task.title}</p>
                          {ngo && (
                            <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                              <Building2 size={12} />
                              {ngo.organization_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {log?.confidence_level && (
                          <ConfidenceBadge level={log.confidence_level} score={log.confidence_score} />
                        )}
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          isCheckedIn ? 'bg-green-100 text-green-700' :
                          isCompleted ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {isCheckedIn ? 'Checked In' : isCompleted ? 'Completed' : 'Assigned'}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-[#6B7280] mt-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6B7280]">
                      {task.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(task.start_date).toLocaleDateString()}
                          {task.end_date && ` - ${new Date(task.end_date).toLocaleDateString()}`}
                        </span>
                      )}
                      {(task.location || task.city) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {task.city || task.location}
                        </span>
                      )}
                      {log?.check_in_distance !== null && log?.check_in_distance !== undefined && (
                        <span className="flex items-center gap-1">
                          <Navigation size={12} />
                          {Math.round(log.check_in_distance)}m from task
                        </span>
                      )}
                    </div>

                    {log && (
                      <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-1 text-xs text-[#6B7280]">
                        {log.check_in_time && (
                          <p className="flex items-center gap-1">
                            <LogIn size={12} />
                            Check-in: {new Date(log.check_in_time).toLocaleString()}
                          </p>
                        )}
                        {log.check_out_time && (
                          <p className="flex items-center gap-1">
                            <LogOut size={12} />
                            Check-out: {new Date(log.check_out_time).toLocaleString()}
                          </p>
                        )}
                        {isCompleted && log.hours && (
                          <p className="flex items-center gap-1 text-blue-600 font-medium">
                            <Clock size={12} />
                            Hours: {log.hours}
                          </p>
                        )}
                        {log.confidence_score !== null && (
                          <p className="flex items-center gap-1 text-[#6B7280]">
                            <ShieldCheck size={12} />
                            Confidence: {log.confidence_score}% ({CONFIDENCE_LEVEL_LABELS[log.confidence_level || ''] || log.confidence_level})
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      {!isCheckedIn && !isCompleted && (
                        <button
                          onClick={() => handleCheckIn(task.id)}
                          disabled={actionLoading === task.id}
                          className="flex items-center gap-1.5 bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          {actionLoading === task.id ? (
                            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                          ) : (
                            <><QrCode size={14} /> Scan & Check In</>
                          )}
                        </button>
                      )}
                      {isCheckedIn && (
                        <button
                          onClick={() => handleCheckOut(task.id)}
                          disabled={actionLoading === task.id}
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          {actionLoading === task.id ? (
                            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                          ) : (
                            <><QrCode size={14} /> Scan & Check Out</>
                          )}
                        </button>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium px-4 py-2">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {attendanceLogs.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#111827] mb-4">Attendance History</h2>
                <div className="bg-white rounded-2xl border border-[#CACDD3] divide-y divide-[#E5E7EB]">
                  {attendanceLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#111827]">
                          {log.task_title || `Task #${log.task_id}`}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{log.task_ngo || 'NGO'}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-[#6B7280]">
                          {log.check_in_time && (
                            <span className="flex items-center gap-1"><LogIn size={11} /> {new Date(log.check_in_time).toLocaleString()}</span>
                          )}
                          {log.check_out_time && (
                            <span className="flex items-center gap-1"><LogOut size={11} /> {new Date(log.check_out_time).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {log.confidence_level && <ConfidenceBadge level={log.confidence_level} score={log.confidence_score} />}
                        {log.hours && Number(log.hours) > 0 && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{log.hours}h</span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          log.status === 'active' ? 'bg-green-100 text-green-700' :
                          log.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          log.status === 'absent' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {STATUS_LABELS[log.status] || log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
