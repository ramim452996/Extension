<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    protected $fillable = [
        'event_name',
        'install_id_hash',
        'number_of_pages',
        'category',
        'ai_provider',
        'model',
        'duration_ms',
        'input_tokens',
        'output_tokens',
        'status',
        'http_status',
        'error_code',
    ];

    protected $casts = [
        'number_of_pages' => 'integer',
        'duration_ms'     => 'integer',
        'input_tokens'    => 'integer',
        'output_tokens'   => 'integer',
        'http_status'     => 'integer',
    ];
}
