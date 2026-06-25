<?php

namespace App\Services;

class TfIdfService
{
    /**
     * Compute TF-IDF vectors for a collection of documents.
     * Returns an array keyed by the document's id.
     *
     * @param array $docs  [ ['id' => 1, 'text' => '...'], ... ]
     * @return array       [ 1 => ['medical' => 0.42, ...], ... ]
     */
    public function compute(array $docs): array
    {
        $totalDocs = count($docs);
        $termFrequencies = [];   // TF per doc
        $documentFrequency = []; // how many docs contain each term

        // --- Step 1: tokenise & compute TF ---
        foreach ($docs as $doc) {
            $terms = $this->tokenise($doc['text']);
            $termCount = count($terms);
            $tf = [];

            foreach (array_count_values($terms) as $term => $count) {
                $tf[$term] = $count / max($termCount, 1);
                $documentFrequency[$term] = ($documentFrequency[$term] ?? 0) + 1;
            }

            $termFrequencies[$doc['id']] = $tf;
        }

        // --- Step 2: multiply by IDF ---
        $vectors = [];

        foreach ($termFrequencies as $id => $tf) {
            $vector = [];
            foreach ($tf as $term => $tfScore) {
                $idf = log(($totalDocs + 1) / (($documentFrequency[$term] ?? 0) + 1)) + 1;
                $weight = $tfScore * $idf;

                if ($weight > 0) {
                    $vector[$term] = round($weight, 6);
                }
            }
            // Sort descending for readability (optional)
            arsort($vector);
            $vectors[$id] = $vector;
        }

        return $vectors;
    }

    private function tokenise(string $text): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s]/', '', $text);
        $words = preg_split('/\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        // Basic stop-word removal
        $stopWords = ['the','a','an','and','or','but','in','on','at','to','for',
                      'of','with','by','is','are','was','were','be','been','have',
                      'has','had','do','does','did','will','would','could','should'];

        return array_values(array_filter($words, fn($w) => !in_array($w, $stopWords)));
    }

    public function cosineSimilarity(array $vectorA, array $vectorB): float
    {
        $dotProduct = 0.0;
        $magnitudeA = 0.0;
        $magnitudeB = 0.0;

        foreach ($vectorA as $term => $weight) {
            $dotProduct += $weight * ($vectorB[$term] ?? 0);
            $magnitudeA += $weight ** 2;
        }

        foreach ($vectorB as $weight) {
            $magnitudeB += $weight ** 2;
        }

        $denominator = sqrt($magnitudeA) * sqrt($magnitudeB);

        return $denominator > 0 ? $dotProduct / $denominator : 0.0;
    }

    public function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a    = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
