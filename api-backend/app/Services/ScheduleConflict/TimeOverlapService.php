<?php

namespace App\Services\ScheduleConflict;

use App\Algorithms\Contracts\TimeOverlapInterface;

class TimeOverlapService implements TimeOverlapInterface
{
    private array $config;

    public function __construct()
    {
        $this->config = config('schedule-conflict');
    }

    public function calculateOverlap(
        ?string $taskAStart, ?string $taskAEnd,
        ?string $taskBStart, ?string $taskBEnd
    ): array {
        $aStart = $taskAStart ? new \DateTime($taskAStart) : null;
        $aEnd = $taskAEnd ? new \DateTime($taskAEnd) : null;
        $bStart = $taskBStart ? new \DateTime($taskBStart) : null;
        $bEnd = $taskBEnd ? new \DateTime($taskBEnd) : null;

        if (!$aStart || !$bStart) {
            return [
                'has_overlap' => false,
                'overlap_minutes' => 0,
                'overlap_ratio' => 0.0,
                'gap_minutes' => null,
                'conflict_type' => 'no_conflict',
            ];
        }

        $effectiveAEnd = $aEnd ?? (clone $aStart)->modify('+4 hours');
        $effectiveBEnd = $bEnd ?? (clone $bStart)->modify('+4 hours');

        $overlapStart = max($aStart, $bStart);
        $overlapEnd = min($effectiveAEnd, $effectiveBEnd);

        if ($overlapStart >= $overlapEnd) {
            $gapMinutes = ($overlapStart->getTimestamp() - $overlapEnd->getTimestamp()) / 60;
            return [
                'has_overlap' => false,
                'overlap_minutes' => 0,
                'overlap_ratio' => 0.0,
                'gap_minutes' => max(0, (int)$gapMinutes),
                'conflict_type' => 'no_conflict',
            ];
        }

        $overlapMinutes = ($overlapEnd->getTimestamp() - $overlapStart->getTimestamp()) / 60;
        $durationA = ($effectiveAEnd->getTimestamp() - $aStart->getTimestamp()) / 60;
        $durationB = ($effectiveBEnd->getTimestamp() - $bStart->getTimestamp()) / 60;
        $maxDuration = max($durationA, $durationB);
        $overlapRatio = $maxDuration > 0 ? $overlapMinutes / $maxDuration : 0;
        $overlapRatio = min(1.0, max(0.0, $overlapRatio));

        return [
            'has_overlap' => true,
            'overlap_minutes' => (int)$overlapMinutes,
            'overlap_ratio' => round($overlapRatio, 4),
            'gap_minutes' => 0,
            'conflict_type' => $this->classifyConflict($overlapRatio),
        ];
    }

    public function hasOverlap(
        ?string $taskAStart, ?string $taskAEnd,
        ?string $taskBStart, ?string $taskBEnd,
        int $bufferMinutes = 0
    ): bool {
        $result = $this->calculateOverlap($taskAStart, $taskAEnd, $taskBStart, $taskBEnd);

        if ($result['has_overlap']) return true;

        if ($bufferMinutes > 0 && $result['gap_minutes'] !== null && $result['gap_minutes'] < $bufferMinutes) {
            return true;
        }

        return false;
    }

    public function classifyConflict(float $overlapRatio): string
    {
        $thresholds = $this->config['severity_thresholds'] ?? [
            'minor' => 0.25, 'partial' => 0.50, 'major' => 0.75, 'complete' => 1.00,
        ];

        if ($overlapRatio >= $thresholds['complete']) return 'complete_conflict';
        if ($overlapRatio >= $thresholds['major']) return 'major_overlap';
        if ($overlapRatio >= $thresholds['partial']) return 'partial_overlap';
        if ($overlapRatio >= $thresholds['minor']) return 'minor_conflict';

        return 'no_conflict';
    }
}
