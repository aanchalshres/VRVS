<?php

namespace App\Algorithms\Matching;

class TfIdfVectorizer
{
    public function compute(array $docs): array
    {
        $totalDocs = count($docs);
        $termFrequencies = [];
        $documentFrequency = [];

        foreach ($docs as $doc) {
            $terms = $this->tokenise($doc['text']);

            $termCount = count($terms);

            $tf = [];

            foreach (array_count_values($terms) as $term => $count) {
                $tf[$term] = $count / max($termCount, 1);

                $documentFrequency[$term] =
                    ($documentFrequency[$term] ?? 0) + 1;
            }

            $termFrequencies[$doc['id']] = $tf;
        }

        $vectors = [];

        foreach ($termFrequencies as $id => $tf) {

            $vector = [];

            foreach ($tf as $term => $tfScore) {

                $idf = log(
                    ($totalDocs + 1)
                    /
                    (($documentFrequency[$term] ?? 0) + 1)
                ) + 1;

                $weight = $tfScore * $idf;

                if ($weight > 0) {
                    $vector[$term] = round($weight, 6);
                }
            }

            arsort($vector);

            $vectors[$id] = $vector;
        }

        return $vectors;
    }

    private function tokenise(string $text): array
    {
        $text = strtolower($text);

        $text = preg_replace('/[^a-z0-9\s]/', '', $text);

        $words = preg_split(
            '/\s+/',
            trim($text),
            -1,
            PREG_SPLIT_NO_EMPTY
        );

        $stopWords = [
            'the','a','an','and','or','but','in','on','at','to',
            'for','of','with','by','is','are','was','were','be',
            'been','have','has','had','do','does','did','will',
            'would','could','should'
        ];

        return array_values(
            array_filter(
                $words,
                fn ($w) => !in_array($w, $stopWords)
            )
        );
    }
}
