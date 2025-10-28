<?php

// Lista blanca de orígenes permitidos
$allowed_origins = [
    'https://test.denicolastbwa.com',
    'https://www.pressstartevolution.com',
    'http://localhost:3000',
];

// Detectar el origen de la petición
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Si el origen está permitido, agregar los encabezados CORS
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

// Respuestas JSON por defecto
header('Content-Type: application/json; charset=utf-8');

// CORS: permitir llamados cross‑origin
// header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Responder preflight y salir temprano
if (isset($_SERVER['REQUEST_METHOD']) && strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') {
    http_response_code(204);
    exit;
}
