<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('contract_requests', 'applicant_photo')) {

            Schema::table('contract_requests', function (Blueprint $table) {
                $table->string('applicant_photo')
                    ->nullable()
                    ->after('notes');
            });

        }
    }


    public function down(): void
    {
        if (Schema::hasColumn('contract_requests', 'applicant_photo')) {

            Schema::table('contract_requests', function (Blueprint $table) {
                $table->dropColumn('applicant_photo');
            });

        }
    }
};