<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],


    'allowed_methods' => [
        '*',
    ],


    'allowed_origins' => [

        // Vite React Local
        'http://localhost:5173',
        'http://127.0.0.1:5173',

        // Production React (Render)
        'https://motorcycle-contract-system-2.onrender.com',

    ],


    'allowed_origins_patterns' => [],


    'allowed_headers' => [
        '*',
    ],


    'exposed_headers' => [],


    'max_age' => 0,


    'supports_credentials' => true,

];