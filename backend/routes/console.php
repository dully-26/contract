<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
| contracts:check-overdue runs daily — it warns customers whose payments
| are overdue, and auto-terminates contracts that remain unpaid past the
| grace period (see App\Console\Commands\SendPaymentReminders).
*/

Schedule::command('contracts:check-overdue')->dailyAt('08:00');