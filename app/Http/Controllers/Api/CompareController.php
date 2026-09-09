<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ComparisonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class CompareController extends Controller
{
    public function __construct(
        private readonly ComparisonService $comparisonService
    ) {}

    /**
     * Handle POST /api/v1/compare
     *
     * Validates input, enforces rate limits, calls ComparisonService,
     * and returns the structured JSON comparison result.
     */
    public function __invoke(Request $request): JsonResponse
    {
        // ── 1. Validate request payload ───────────────────────────────────────
        $validated = $request->validate([
            'installId'              => ['required', 'string', 'max:255'],
            'goal'                   => ['nullable', 'string', 'max:300'],
            'pages'                  => ['required', 'array', 'min:2', 'max:4'],
            'pages.*.id'             => ['required', 'string'],
            'pages.*.url'            => ['required', 'url'],
            'pages.*.domain'         => ['required', 'string'],
            'pages.*.title'          => ['required', 'string'],
            'pages.*.importantText'  => ['required', 'string', 'max:4000'],
        ]);

        // ── 2. Reject duplicate URLs ──────────────────────────────────────────
        $urls = array_column($validated['pages'], 'url');
        if (count($urls) !== count(array_unique($urls))) {
            throw ValidationException::withMessages([
                'pages' => ['This page is already in your comparison.'],
            ]);
        }

        // ── 3. Rate limiting ──────────────────────────────────────────────────
        $installId = $validated['installId'];
        $ip        = $request->ip();

        // 10 requests per installId per 24 hours
        $dailyKey      = "compare:daily:{$installId}";
        $dailyLimit    = 10;
        $dailyDecaySeconds = 24 * 60 * 60;

        // 30 requests per IP per hour
        $hourlyKey     = "compare:hourly:{$ip}";
        $hourlyLimit   = 30;
        $hourlyDecaySeconds = 60 * 60;

        if (RateLimiter::tooManyAttempts($dailyKey, $dailyLimit)) {
            $seconds = RateLimiter::availableIn($dailyKey);

            return response()->json([
                'message'    => 'Daily comparison limit reached. You may run up to 10 comparisons per 24 hours.',
                'retry_after' => $seconds,
            ], 429);
        }

        if (RateLimiter::tooManyAttempts($hourlyKey, $hourlyLimit)) {
            $seconds = RateLimiter::availableIn($hourlyKey);

            return response()->json([
                'message'    => 'Hourly rate limit exceeded. Please wait before comparing again.',
                'retry_after' => $seconds,
            ], 429);
        }

        // Increment both counters
        RateLimiter::hit($dailyKey,  $dailyDecaySeconds);
        RateLimiter::hit($hourlyKey, $hourlyDecaySeconds);

        // ── 4. Generate comparison ────────────────────────────────────────────
        try {
            $result = $this->comparisonService->generateComparison($validated);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }

        return response()->json($result, 200);
    }
}
