<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('tx_ref')->nullable()->unique()->after('reference');
            $table->enum('status', ['pending', 'success', 'failed'])->default('success')->after('method');
            $table->json('gateway_response')->nullable()->after('status');
        });
        // Update method enum to include gateway
        DB::statement("ALTER TABLE payments MODIFY method ENUM('system','cash','flutterwave') DEFAULT 'system'");
    }
    public function down(): void {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['tx_ref', 'status', 'gateway_response']);
        });
    }
};