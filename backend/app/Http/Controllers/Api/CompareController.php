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
     * Handle POST /api/compare or /api/v1/compare
     */
    public function compare(Request $request): JsonResponse
    {
        return $this->__invoke($request);
    }

    /**
     * Handle POST /api/v1/compare
     *
     * Validates input, enforces rate limits, calls ComparisonService,
     * and returns the structured JSON comparison result.
     */
    public function __invoke(Request $request): JsonResponse
    {
        // ── 1. Normalize input for backwards & schema compatibility ──────────
        $data = $request->all();
        if (empty($data['installId'])) {
            $data['installId'] = 'client-' . substr(md5($request->ip() . $request->header('User-Agent')), 0, 16);
        }
        if (isset($data['userPriority']) && !isset($data['goal'])) {
            $data['goal'] = $data['userPriority'];
        }
        if (isset($data['pages']) && is_array($data['pages'])) {
            foreach ($data['pages'] as $i => &$p) {
                if (!isset($p['id'])) {
                    $p['id'] = 'page-' . ($i + 1);
                }
                if (!isset($p['domain']) && isset($p['url'])) {
                    $p['domain'] = parse_url($p['url'], PHP_URL_HOST) ?? 'webpage';
                }
                if (isset($p['content']) && !isset($p['importantText'])) {
                    $p['importantText'] = $p['content'];
                }
                if (isset($p['importantText']) && !isset($p['content'])) {
                    $p['content'] = $p['importantText'];
                }
            }
            unset($p);
            $request->merge($data);
        }

        // ── 2. Validate request payload ───────────────────────────────────────
        $validated = $request->validate([
            'installId'              => ['required', 'string', 'max:255'],
            'goal'                   => ['nullable', 'string', 'max:300'],
            'userPriority'           => ['nullable', 'string', 'max:300'],
            'pages'                  => ['required', 'array', 'min:2', 'max:4'],
            'pages.*.id'             => ['nullable', 'string'],
            'pages.*.url'            => ['required', 'url'],
            'pages.*.domain'         => ['nullable', 'string'],
            'pages.*.title'          => ['required', 'string'],
            'pages.*.importantText'  => ['nullable', 'string'],
            'pages.*.content'        => ['nullable', 'string'],
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
