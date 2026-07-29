<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'app' => 'Motorcycle Contract & Sales Management API',
        'status' => 'running',
        'frontend' => config('app.frontend_url'),
    ]);
});


Route::get('/payment/callback', function () {
    return redirect(config('app.frontend_url') . '/payments?status=' . request('status'));
});


// TEMPORARY: Run migrations
Route::withoutMiddleware(['web'])->group(function () {

    Route::get('/run-migrate', function () {

        Artisan::call('migrate', [
            '--force' => true
        ]);

        return response()->json([
            'status' => 'migration completed',
            'output' => Artisan::output()
        ]);
    });


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

});