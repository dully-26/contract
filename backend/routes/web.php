<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| This project is a decoupled SPA (React) + API (Laravel) architecture.
| Almost everything lives in routes/api.php.
*/

Route::get('/', function () {
    return response()->json([
        'app' => 'Motorcycle Contract & Sales Management API',
        'status' => 'running',
        'frontend' => config('app.frontend_url'),
    ]);
});


// Optional: Flutterwave redirect-based callback
Route::get('/payment/callback', function () {
    return redirect(config('app.frontend_url') . '/payments?status=' . request('status'));
});


// TEMPORARY: Run database migrations on Railway database
// Remove this route after migration is completed
Route::get('/run-migrate', function () {

    Artisan::call('migrate', [
        '--force' => true
    ]);

    return response()->json([
        'status' => 'migration completed',
        'output' => Artisan::output()
    ]);
});


// TEMPORARY: Create admin user
// Remove this route after seeding is completed
Route::get('/run-seeder', function () {

    Artisan::call('db:seed', [
        '--class' => 'AdminSeeder',
        '--force' => true
    ]);

    return response()->json([
        'status' => 'seeder completed',
        'output' => Artisan::output()
    ]);
});