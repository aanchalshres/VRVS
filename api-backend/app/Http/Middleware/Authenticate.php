<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API requests, don't redirect - return null to let exception handler deal with it
        if ($request->is('api/*')) {
            return null;
        }

        // For web requests, redirect to login
        return $request->expectsJson() ? null : route('login');
    }
}
