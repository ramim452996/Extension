<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Record an anonymous product metric event.
     * POST /api/v1/analytics/event or /api/analytics/event
     */
    public function record(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event'           => ['required', 'string', 'in:extension_installed,comparison_started,comparison_completed,comparison_error'],
            'installId'       => ['nullable', 'string', 'max:255'],
            'numberOfPages'   => ['nullable', 'integer', 'min:1', 'max:10'],
            'category'        => ['nullable', 'string', 'max:100'],
            'durationMs'      => ['nullable', 'integer'],
            'errorCode'       => ['nullable', 'string', 'max:100'],
        ]);

        $installIdHash = !empty($validated['installId'])
            ? hash('sha256', $validated['installId'])
            : null;

        AnalyticsEvent::create([
            'event_name'      => $validated['event'],
            'install_id_hash' => $installIdHash,
            'number_of_pages' => $validated['numberOfPages'] ?? null,
            'category'        => $validated['category'] ?? null,
            'duration_ms'     => $validated['durationMs'] ?? null,
            'status'          => $validated['event'] === 'comparison_error' ? 'error' : 'success',
            'error_code'      => $validated['errorCode'] ?? null,
        ]);

        return response()->json(['ok' => true], 200);
    }

    /**
     * Aggregated metrics for administrative overview.
     * GET /api/v1/analytics/metrics or /api/analytics/metrics
     */
    public function metrics(Request $request): JsonResponse
    {
        $todayStart = Carbon::today();

        // 1. Unique users today (distinct hashed installId active today)
        $usersToday = AnalyticsEvent::where('created_at', '>=', $todayStart)
            ->whereNotNull('install_id_hash')
            ->distinct('install_id_hash')
            ->count('install_id_hash');

        // 2. Comparisons today (started or completed)
        $comparisonsToday = AnalyticsEvent::where('created_at', '>=', $todayStart)
            ->whereIn('event_name', ['comparison_completed', 'comparison_started'])
            ->count();

        // 3. Successful comparisons
        $successfulComparisons = AnalyticsEvent::where('event_name', 'comparison_completed')
            ->where('status', 'success')
            ->count();

        // 4. API / Comparison errors
        $apiErrors = AnalyticsEvent::where('status', 'error')
            ->orWhere('event_name', 'comparison_error')
            ->count();

        // 5. Average pages per comparison
        $avgPages = AnalyticsEvent::whereNotNull('number_of_pages')
            ->where('number_of_pages', '>', 0)
            ->avg('number_of_pages');

        // 6. AI tokens used (sum of input + output tokens)
        $totalInputTokens = AnalyticsEvent::sum('input_tokens') ?? 0;
        $totalOutputTokens = AnalyticsEvent::sum('output_tokens') ?? 0;
        $totalTokens = $totalInputTokens + $totalOutputTokens;

        // 7. Most common comparison categories
        $commonCategories = AnalyticsEvent::select('category', DB::raw('count(*) as total'))
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->groupBy('category')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->pluck('total', 'category');

        return response()->json([
            'users_today'                 => $usersToday,
            'comparisons_today'           => $comparisonsToday,
            'successful_comparisons'      => $successfulComparisons,
            'api_errors'                  => $apiErrors,
            'average_pages_per_comparison'=> $avgPages ? round((float) $avgPages, 1) : 0,
            'ai_tokens_used'              => $totalTokens,
            'most_common_categories'      => $commonCategories,
        ], 200);
    }
}
