<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function () {
    RateLimiter::clear('compare:daily:test-install-123');
    RateLimiter::clear('compare:hourly:127.0.0.1');
});

test('rejects request with fewer than 2 pages', function () {
    $response = $this->postJson('/api/compare', [
        'installId' => 'test-install-123',
        'pages'     => [
            ['url' => 'https://example.com/item1', 'title' => 'Item 1'],
        ],
    ]);

    $response->assertStatus(422);
});

test('rejects duplicate URLs', function () {
    $response = $this->postJson('/api/compare', [
        'installId' => 'test-install-123',
        'pages'     => [
            ['url' => 'https://example.com/item1', 'title' => 'Item 1'],
            ['url' => 'https://example.com/item1', 'title' => 'Item 1 Duplicate'],
        ],
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['pages']);
});

test('records anonymous analytics event', function () {
    $response = $this->postJson('/api/analytics/event', [
        'event'         => 'comparison_started',
        'installId'     => 'test-install-123',
        'numberOfPages' => 3,
    ]);

    $response->assertStatus(200)
             ->assertJson(['ok' => true]);

    $this->assertDatabaseHas('analytics_events', [
        'event_name'      => 'comparison_started',
        'install_id_hash' => hash('sha256', 'test-install-123'),
        'number_of_pages' => 3,
    ]);
});

test('retrieves aggregated admin metrics', function () {
    $response = $this->getJson('/api/analytics/metrics');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'users_today',
                 'comparisons_today',
                 'successful_comparisons',
                 'api_errors',
                 'average_pages_per_comparison',
                 'ai_tokens_used',
                 'most_common_categories',
             ]);
});
