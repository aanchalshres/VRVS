<?php

namespace App\Services;

use App\Algorithms\Matching\TfIdfVectorizer;
use App\Models\Task;
use App\Models\VolunteerProfile;

class TfIdfGenerationService
{
    public function __construct(
        private TfIdfVectorizer $vectorizer,
    ) {}

    public function generateForVolunteer(VolunteerProfile $profile): void
    {
        $text = $this->extractVolunteerText($profile);

        $profile->updateQuietly([
            'tfidf_vector' => $this->computeVector($profile->id, $text),
        ]);
    }

    public function generateForTask(Task $task): void
    {
        $text = $this->extractTaskText($task);

        $task->updateQuietly([
            'tfidf_vector' => $this->computeVector($task->id, $text),
        ]);
    }

    private function computeVector(int $id, string $text): array
    {
        if (empty(trim($text))) {
            return [];
        }

        $vectors = $this->vectorizer->compute([
            ['id' => $id, 'text' => $text],
        ]);

        return $vectors[$id] ?? [];
    }

    private function extractVolunteerText(VolunteerProfile $profile): string
    {
        $parts = [];

        if ($profile->bio) {
            $parts[] = $profile->bio;
        }

        if ($profile->primary_location) {
            $parts[] = $profile->primary_location;
        }

        if ($profile->city) {
            $parts[] = $profile->city;
        }

        if ($profile->country) {
            $parts[] = $profile->country;
        }

        if ($profile->relationLoaded('skills')) {
            $parts[] = $profile->skills->pluck('name')->implode(' ');
        } elseif ($profile->skills()->exists()) {
            $parts[] = $profile->skills()->pluck('name')->implode(' ');
        }

        return implode(' ', array_filter($parts));
    }

    private function extractTaskText(Task $task): string
    {
        $parts = [];

        if ($task->title) {
            $parts[] = $task->title;
        }

        if ($task->description) {
            $parts[] = $task->description;
        }

        if ($task->relationLoaded('category') && $task->category) {
            $parts[] = $task->category->name;
        } elseif ($task->category_id) {
            $parts[] = $task->category()->value('name') ?? '';
        }

        if ($task->relationLoaded('skills')) {
            $parts[] = $task->skills->pluck('name')->implode(' ');
        } elseif ($task->skills()->exists()) {
            $parts[] = $task->skills()->pluck('name')->implode(' ');
        }

        if ($task->location) {
            $parts[] = $task->location;
        }

        if ($task->city) {
            $parts[] = $task->city;
        }

        if ($task->country) {
            $parts[] = $task->country;
        }

        return implode(' ', array_filter($parts));
    }
}
