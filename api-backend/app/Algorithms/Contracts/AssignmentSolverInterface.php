<?php

namespace App\Algorithms\Contracts;

interface AssignmentSolverInterface
{
    /**
     * Solve a cost matrix.
     *
     * @param array $costMatrix
     * @return array
     *
     * Example:
     * [
     *     0 => 2,
     *     1 => 0,
     *     2 => 1,
     * ]
     * meaning:
     * volunteer[0] -> task[2]
     * volunteer[1] -> task[0]
     * volunteer[2] -> task[1]
     */
    public function solve(array $costMatrix): array;
}
