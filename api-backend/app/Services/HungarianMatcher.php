<?php

namespace App\Services;

class HungarianMatcher
{
   
    public function solve(array $costMatrix): array
    {
        $n    = count($costMatrix);
        $u    = array_fill(0, $n + 1, 0);
        $v    = array_fill(0, $n + 1, 0);
        $p    = array_fill(0, $n + 1, 0);
        $way  = array_fill(0, $n + 1, 0);

        for ($i = 1; $i <= $n; $i++) {
            $p[0]    = $i;
            $j0      = 0;
            $minVal  = array_fill(0, $n + 1, PHP_INT_MAX);
            $used    = array_fill(0, $n + 1, false);

            do {
                $used[$j0] = true;
                $i0        = $p[$j0];
                $delta     = PHP_INT_MAX;
                $j1        = -1;

                for ($j = 1; $j <= $n; $j++) {
                    if (!$used[$j]) {
                        $cur = ($costMatrix[$i0 - 1][$j - 1] ?? 0) - $u[$i0] - $v[$j];
                        if ($cur < $minVal[$j]) {
                            $minVal[$j] = $cur;
                            $way[$j]    = $j0;
                        }
                        if ($minVal[$j] < $delta) {
                            $delta = $minVal[$j];
                            $j1    = $j;
                        }
                    }
                }

                for ($j = 0; $j <= $n; $j++) {
                    if ($used[$j]) {
                        $u[$p[$j]] += $delta;
                        $v[$j]     -= $delta;
                    } else {
                        $minVal[$j] -= $delta;
                    }
                }

                $j0 = $j1;
            } while ($p[$j0] !== 0);

            do {
                $j1      = $way[$j0];
                $p[$j0]  = $p[$j1];
                $j0      = $j1;
            } while ($j0);
        }

        $result = [];
        for ($j = 1; $j <= $n; $j++) {
            if ($p[$j]) {
                $result[$p[$j] - 1] = $j - 1;
            }
        }

        return $result;
    }

    /**
     * Build cost matrix from scores.
     * cost = 1 - finalScore (Hungarian minimizes, we want to maximize score)
     */
    public function buildCostMatrix(array $volunteers, array $tasks, callable $scoreFn): array
    {
        $matrix = [];

        foreach ($volunteers as $i => $volunteer) {
            $row = [];
            foreach ($tasks as $j => $task) {
                $score   = $scoreFn($volunteer, $task); // 0–1
                $row[$j] = round(1 - $score, 6);        // invert: low cost = high score
            }
            $matrix[$i] = $row;
        }

        return $matrix;
    }
}
