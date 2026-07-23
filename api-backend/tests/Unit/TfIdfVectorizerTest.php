<?php

use App\Algorithms\Matching\TfIdfVectorizer;

beforeEach(function () {
    $this->vectorizer = new TfIdfVectorizer();
});

it('computes tf-idf vector for a single document', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => 'volunteer teaching children in school'],
    ]);

    expect($result)->toHaveKey(1);
    expect($result[1])->not->toBeEmpty();
});

it('computes multiple documents', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => 'volunteer teaching math'],
        ['id' => 2, 'text' => 'volunteer teaching science'],
    ]);

    expect($result)->toHaveKeys([1, 2]);
    expect($result[1])->not->toBeEmpty();
    expect($result[2])->not->toBeEmpty();
});

it('handles empty text', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => ''],
    ]);

    expect($result[1])->toBeEmpty();
});

it('handles whitespace-only text', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => '   '],
    ]);

    expect($result[1])->toBeEmpty();
});

it('removes stop words', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => 'the and a an in on at for of with by is are'],
    ]);

    expect($result[1])->toBeEmpty();
});

it('produces weighted vectors sorted by weight descending', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => 'teaching teaching teaching math science'],
    ]);

    $terms = array_keys($result[1]);
    $weights = array_values($result[1]);

    for ($i = 0; $i < count($weights) - 1; $i++) {
        expect($weights[$i])->toBeGreaterThanOrEqual($weights[$i + 1]);
    }
    expect($terms)->toContain('teaching');
});

it('gives higher tf-idf to rarer terms', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => 'teaching math math'],
        ['id' => 2, 'text' => 'teaching science'],
    ]);

    expect($result[1]['math'])->toBeGreaterThan($result[1]['teaching']);
});

it('rounds weights to 6 decimal places', function () {
    $result = $this->vectorizer->compute([
        ['id' => 1, 'text' => 'volunteer teaching children in school'],
    ]);

    foreach ($result[1] as $weight) {
        $parts = explode('.', (string) $weight);
        if (isset($parts[1])) {
            expect(strlen($parts[1]))->toBeLessThanOrEqual(6);
        }
    }
});

it('produces identical vectors for identical inputs', function () {
    $input = ['id' => 1, 'text' => 'volunteer teaching math science'];

    $result1 = $this->vectorizer->compute([$input]);
    $result2 = $this->vectorizer->compute([$input]);

    expect($result1[1])->toEqual($result2[1]);
});
