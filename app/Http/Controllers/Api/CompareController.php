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
        if (isset($data['userGoal']) && !isset($data['goal'])) {
            $data['goal'] = $data['userGoal'];
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

        // ── 2. Validate request payload & enforce limits ─────────────────────
        $maxChars = config('services.rate_limit.max_text_chars', 5000);

        $validated = $request->validate([
            'installId'              => ['required', 'string', 'max:255'],
            'goal'                   => ['nullable', 'string', 'max:300'],
            'userPriority'           => ['nullable', 'string', 'max:300'],
            'pages'                  => ['required', 'array', 'min:2', 'max:4'],
            'pages.*.id'             => ['nullable', 'string'],
            'pages.*.url'            => ['required', 'url', 'regex:/^https?:\/\//i'],
            'pages.*.domain'         => ['nullable', 'string'],
            'pages.*.title'          => ['required', 'string', 'max:500'],
            'pages.*.importantText'  => ['nullable', 'string', "max:{$maxChars}"],
            'pages.*.content'        => ['nullable', 'string', "max:{$maxChars}"],
        ]);

        // Sanitize and normalize URLs (strip credentials, fragments, control characters)
        foreach ($validated['pages'] as &$p) {
            $parsed = filter_var($p['url'], FILTER_SANITIZE_URL);
            $parts = parse_url($parsed);
            if (empty($parts['scheme']) || !in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
                throw ValidationException::withMessages([
                    'pages' => ['Only valid HTTP/HTTPS URLs can be compared.'],
                ]);
            }
            // Strip any auth credentials or fragments
            $sanitizedUrl = $parts['scheme'] . '://' . ($parts['host'] ?? '');
            if (!empty($parts['port'])) {
                $sanitizedUrl .= ':' . $parts['port'];
            }
            $sanitizedUrl .= ($parts['path'] ?? '/');
            if (!empty($parts['query'])) {
                $sanitizedUrl .= '?' . $parts['query'];
            }
            $p['url'] = $sanitizedUrl;
        }
        unset($p);

        // ── 3. Reject duplicate URLs ──────────────────────────────────────────
        $urls = array_column($validated['pages'], 'url');
        if (count($urls) !== count(array_unique($urls))) {
            throw ValidationException::withMessages([
                'pages' => ['This page is already in your comparison.'],
            ]);
        }

        // ── 4. Rate limiting (Per install & per IP) ───────────────────────────
        $installId = $validated['installId'];
        $ip        = $request->ip();

        // Configurable limits (default: 10/day per installation, 30/hour per IP)
        $dailyLimit        = config('services.rate_limit.daily_per_install', 10);
        $dailyDecaySeconds = 24 * 60 * 60;
        $dailyKey          = "compare:daily:{$installId}";

        $hourlyLimit        = config('services.rate_limit.hourly_per_ip', 30);
        $hourlyDecaySeconds = 60 * 60;
        $hourlyKey          = "compare:hourly:{$ip}";

        if (RateLimiter::tooManyAttempts($dailyKey, $dailyLimit)) {
            $seconds = RateLimiter::availableIn($dailyKey);

            logger()->info('CompareController: Daily limit reached', [
                'installIdHash' => hash('sha256', $installId),
                'retryAfter'    => $seconds,
            ]);

            return response()->json([
                'message'     => "Today's free comparison limit has been reached. Please try again later.",
                'retry_after' => $seconds,
            ], 429);
        }

        if (RateLimiter::tooManyAttempts($hourlyKey, $hourlyLimit)) {
            $seconds = RateLimiter::availableIn($hourlyKey);

            logger()->info('CompareController: Hourly IP limit reached', [
                'ipHash'     => hash('sha256', $ip),
                'retryAfter' => $seconds,
            ]);

            return response()->json([
                'message'     => "Today's free comparison limit has been reached. Please try again later.",
                'retry_after' => $seconds,
            ], 429);
        }

        // Increment both counters
        RateLimiter::hit($dailyKey,  $dailyDecaySeconds);
        RateLimiter::hit($hourlyKey, $hourlyDecaySeconds);

        // ── 5. Generate comparison with safe telemetry logging ────────────────
        // Requirements: NEVER log raw page content, private page data, or user text.
        // Allowed: RequestId, InstallId hash, NumberOfPages, Duration, AI provider, Model, Success/failure, HTTP status.
        $requestId = (string) \Illuminate\Support\Str::uuid();
        $startTime = microtime(true);
        $activeProvider = config('services.ai_provider', 'groq');
        $activeModel = config("services.{$activeProvider}.model", 'default');

        try {
            $result = $this->comparisonService->generateComparison($validated);
            $durationMs = (int) round((microtime(true) - $startTime) * 1000);

            logger()->info('Comparison request completed', [
                'requestId'     => $requestId,
                'installIdHash' => hash('sha256', $installId),
                'numberOfPages' => count($validated['pages']),
                'durationMs'    => $durationMs,
                'aiProvider'    => $activeProvider,
                'model'         => $activeModel,
                'status'        => 'success',
                'httpStatus'    => 200,
            ]);

            // Save anonymous product event (zero page content/URLs logged)
            try {
                \App\Models\AnalyticsEvent::create([
                    'event_name'      => 'comparison_completed',
                    'install_id_hash' => hash('sha256', $installId),
                    'number_of_pages' => count($validated['pages']),
                    'category'        => $result['comparisonType'] ?? null,
                    'ai_provider'     => $activeProvider,
                    'model'           => $activeModel,
                    'duration_ms'     => $durationMs,
                    'status'          => 'success',
                    'http_status'     => 200,
                ]);
            } catch (\Throwable $t) {
                // Non-blocking: analytics should never break core user flows
            }

            return response()->json($result, 200);
        } catch (\RuntimeException $e) {
            $durationMs = (int) round((microtime(true) - $startTime) * 1000);

            logger()->error('Comparison request failed', [
                'requestId'     => $requestId,
                'installIdHash' => hash('sha256', $installId),
                'numberOfPages' => count($validated['pages']),
                'durationMs'    => $durationMs,
                'aiProvider'    => $activeProvider,
                'model'         => $activeModel,
                'status'        => 'failure',
                'httpStatus'    => 503,
                'errorSummary'  => $e->getMessage(),
            ]);

            try {
                \App\Models\AnalyticsEvent::create([
                    'event_name'      => 'comparison_error',
                    'install_id_hash' => hash('sha256', $installId),
                    'number_of_pages' => count($validated['pages']),
                    'ai_provider'     => $activeProvider,
                    'model'           => $activeModel,
                    'duration_ms'     => $durationMs,
                    'status'          => 'error',
                    'http_status'     => 503,
                    'error_code'      => substr($e->getMessage(), 0, 100),
                ]);
            } catch (\Throwable $t) {
                // Non-blocking
            }

            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }
    }
}
