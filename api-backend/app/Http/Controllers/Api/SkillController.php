<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;

class SkillController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Skill::orderBy('name')->get()
        ]);
    }
}
