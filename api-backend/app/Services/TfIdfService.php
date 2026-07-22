<?php

namespace App\Services;

class TfIdfService
{
    public function compute(array $docs): array
    {
        $numDocs = count($docs);
        $termDocFreq = [];
        $docTerms = [];

        foreach ($docs as $doc) {
            $text = strtolower($doc['text']);
            $words = str_word_count($text, 1);
            $terms = array_count_values($words);
            $docTerms[$doc['id']] = $terms;
            foreach ($terms as $term => $count) {
                $termDocFreq[$term] = ($termDocFreq[$term] ?? 0) + 1;
            }
        }

        $vectors = [];
        foreach ($docTerms as $id => $terms) {
            $maxFreq = max(array_values($terms)) ?: 1;
            $vector = [];
            foreach ($terms as $term => $count) {
                $tf = $count / $maxFreq;
                $idf = log(($numDocs + 1) / ($termDocFreq[$term] + 1)) + 1;
                $vector[$term] = round($tf * $idf, 6);
            }
            $vectors[$id] = $vector;
        }

        return $vectors;
    }
}
