<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        if (!Schema::hasColumn('contracts', 'issued_by')) {

            Schema::table('contracts', function (Blueprint $table) {

                $table->foreignId('issued_by')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('users')
                    ->nullOnDelete();

            });

        }
    }


    public function down(): void
    {
        if (Schema::hasColumn('contracts', 'issued_by')) {

            Schema::table('contracts', function (Blueprint $table) {

                $table->dropForeign(['issued_by']);
                $table->dropColumn('issued_by');

            });

        }
    }

};