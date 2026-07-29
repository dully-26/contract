<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {

            if (!Schema::hasColumn('contracts', 'accepted_at')) {
                $table->timestamp('accepted_at')
                    ->nullable()
                    ->after('status');
            }

            if (!Schema::hasColumn('contracts', 'accepted_by')) {
                $table->foreignId('accepted_by')
                    ->nullable()
                    ->after('accepted_at')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('contracts', 'acceptance_notes')) {
                $table->text('acceptance_notes')
                    ->nullable()
                    ->after('accepted_by');
            }

        });
    }


    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {

            if (Schema::hasColumn('contracts', 'accepted_at')) {
                $table->dropColumn('accepted_at');
            }

            if (Schema::hasColumn('contracts', 'accepted_by')) {
                $table->dropForeign(['accepted_by']);
                $table->dropColumn('accepted_by');
            }

            if (Schema::hasColumn('contracts', 'acceptance_notes')) {
                $table->dropColumn('acceptance_notes');
            }

        });
    }
};