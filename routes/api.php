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

