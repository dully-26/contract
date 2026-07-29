<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('motorcycles', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_name')->nullable();
        });
    }
    public function down(): void {
        Schema::table('motorcycles', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'location_name']);
        });
    }
};