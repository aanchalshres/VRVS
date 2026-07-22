<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Certificate;
use App\Models\NgoProfile;
use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    public function __construct(
        private ActivityLogService $activityLog
    ) {}

    public function volunteers(Request $request)
    {
        $query = User::where('role', 'volunteer')->with('volunteerProfile');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $volunteers = $query->get();

        $csv = $this->toCsv($volunteers, function ($v) {
            return [
                'ID' => $v->id,
                'Name' => $v->name,
                'Email' => $v->email,
                'Phone' => $v->phone ?? '',
                'City' => $v->volunteerProfile->city ?? '',
                'Country' => $v->volunteerProfile->country ?? '',
                'Is Active' => $v->is_active ? 'Yes' : 'No',
                'Joined' => $v->created_at->format('Y-m-d'),
            ];
        });

        $this->activityLog->exportGenerated($request->user()->id, 'volunteers', $request->ip());

        return $this->csvResponse($csv, 'volunteers.csv');
    }

    public function ngos(Request $request)
    {
        $query = NgoProfile::with('user');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('organization_name', 'like', "%{$s}%");
        }

        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->verification_status);
        }

        $ngos = $query->get();

        $csv = $this->toCsv($ngos, function ($n) {
            return [
                'ID' => $n->id,
                'Organization' => $n->organization_name,
                'Registration #' => $n->registration_number ?? '',
                'Email' => $n->user->email ?? '',
                'Phone' => $n->user->phone ?? '',
                'City' => $n->city ?? '',
                'Status' => $n->verification_status ?? 'pending',
                'Joined' => $n->created_at->format('Y-m-d'),
            ];
        });

        $this->activityLog->exportGenerated($request->user()->id, 'ngos', $request->ip());

        return $this->csvResponse($csv, 'ngos.csv');
    }

    public function applications(Request $request)
    {
        $query = Application::with(['volunteer', 'task.ngo']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $apps = $query->get();

        $csv = $this->toCsv($apps, function ($a) {
            return [
                'ID' => $a->id,
                'Volunteer' => $a->volunteer->name ?? '',
                'Task' => $a->task->title ?? '',
                'NGO' => $a->task->ngo->organization_name ?? '',
                'Status' => $a->status ?? 'pending',
                'Score' => $a->recommendation_score ?? '',
                'Applied' => $a->created_at->format('Y-m-d'),
            ];
        });

        $this->activityLog->exportGenerated($request->user()->id, 'applications', $request->ip());

        return $this->csvResponse($csv, 'applications.csv');
    }

    public function attendance(Request $request)
    {
        $query = ServiceLog::with(['volunteer', 'task.ngo']);

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $logs = $query->get();

        $csv = $this->toCsv($logs, function ($l) {
            return [
                'ID' => $l->id,
                'Volunteer' => $l->volunteer->name ?? '',
                'Task' => $l->task->title ?? '',
                'NGO' => $l->task->ngo->organization_name ?? '',
                'Date' => $l->date ?? $l->created_at->format('Y-m-d'),
                'Hours' => $l->hours ?? 0,
                'Status' => $l->status ?? 'pending',
            ];
        });

        $this->activityLog->exportGenerated($request->user()->id, 'attendance', $request->ip());

        return $this->csvResponse($csv, 'attendance.csv');
    }

    public function tasks(Request $request)
    {
        $query = Task::with('ngo');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->get();

        $csv = $this->toCsv($tasks, function ($t) {
            return [
                'ID' => $t->id,
                'Title' => $t->title ?? '',
                'NGO' => $t->ngo->organization_name ?? '',
                'Category' => $t->category ?? '',
                'Location' => $t->location ?? '',
                'Status' => $t->status ?? 'Open',
                'Start Date' => $t->start_date ?? '',
                'End Date' => $t->end_date ?? '',
                'Created' => $t->created_at->format('Y-m-d'),
            ];
        });

        $this->activityLog->exportGenerated($request->user()->id, 'tasks', $request->ip());

        return $this->csvResponse($csv, 'tasks.csv');
    }

    public function reports(Request $request)
    {
        $query = \App\Models\Report::with(['reporter', 'againstUser']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->get();

        $csv = $this->toCsv($reports, function ($r) {
            return [
                'ID' => $r->id,
                'Reported By' => $r->reporter->name ?? '',
                'Against' => $r->againstUser->name ?? '',
                'Type' => $r->report_type ?? '',
                'Reason' => $r->reason ?? '',
                'Status' => $r->status ?? 'open',
                'Created' => $r->created_at->format('Y-m-d'),
            ];
        });

        $this->activityLog->exportGenerated($request->user()->id, 'reports', $request->ip());

        return $this->csvResponse($csv, 'reports.csv');
    }

    public function serviceLogs(Request $request)
    {
        return $this->attendance($request);
    }

    private function toCsv($data, callable $mapper): string
    {
        $output = fopen('php://temp', 'r+');
        $headerWritten = false;

        foreach ($data as $item) {
            $row = $mapper($item);
            if (!$headerWritten) {
                fputcsv($output, array_keys($row));
                $headerWritten = true;
            }
            fputcsv($output, array_values($row));
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    private function csvResponse(string $csv, string $filename)
    {
        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => strlen($csv),
        ]);
    }
}
