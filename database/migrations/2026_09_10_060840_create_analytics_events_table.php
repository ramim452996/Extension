<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_name', 50)->index(); // 'extension_installed', 'comparison_started', 'comparison_completed', 'comparison_error'
            $table->string('install_id_hash', 64)->nullable()->index(); // SHA256 hashed
            $table->unsignedTinyInteger('number_of_pages')->nullable();
            $table->string('category', 100)->nullable()->index(); // e.g. 'Software / SaaS', 'Physical Products', etc.
            $table->string('ai_provider', 50)->nullable();
            $table->string('model', 100)->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->string('status', 20)->default('success'); // 'success' | 'error'
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->string('error_code', 100)->nullable();
            $table->timestamps();

            $table->index(['created_at', 'event_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
