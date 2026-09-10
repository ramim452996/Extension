<?php

use App\Http\Controllers\Api\CompareController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned the "api" middleware group.
|
*/

// ── Compare Anything ──────────────────────────────────────────────────────────
Route::post('/v1/compare', CompareController::class);
Route::post('/compare', CompareController::class);

// ── Anonymous Product Metrics (Requirement 32) ────────────────────────────────
Route::post('/v1/analytics/event', [\App\Http\Controllers\Api\AnalyticsController::class, 'record']);
Route::post('/analytics/event', [\App\Http\Controllers\Api\AnalyticsController::class, 'record']);
Route::get('/v1/analytics/metrics', [\App\Http\Controllers\Api\AnalyticsController::class, 'metrics']);
Route::get('/analytics/metrics', [\App\Http\Controllers\Api\AnalyticsController::class, 'metrics']);

