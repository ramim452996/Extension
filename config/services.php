<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ── AI Providers ──────────────────────────────────────────────────────────

    'ai_provider' => env('AI_PROVIDER', 'groq'),

    'groq' => [
        'key'      => env('GROQ_API_KEY'),
        'model'    => env('GROQ_MODEL', 'groq/compound-mini'),
        'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
    ],

    'openrouter' => [
        'key'      => env('OPENROUTER_API_KEY'),
        'model'    => env('OPENROUTER_MODEL', 'openai/gpt-oss-20b'),
        'endpoint' => 'https://openrouter.ai/api/v1/chat/completions',
    ],

    // ── Rate Limiting & Protection ────────────────────────────────────────────

    'rate_limit' => [
        'daily_per_install'  => (int) env('RATE_LIMIT_DAILY_PER_INSTALL', 10),
        'hourly_per_ip'      => (int) env('RATE_LIMIT_HOURLY_PER_IP', 30),
        'max_text_chars'     => (int) env('MAX_TEXT_CHARS_PER_PAGE', 5000),
    ],

];
