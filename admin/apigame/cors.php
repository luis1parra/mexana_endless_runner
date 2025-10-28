<?php
// ======================================================
// CORS Handler — Mexana Game API
// ======================================================
// Permite el acceso cruzado entre dominios controlados,
// incluyendo test.denicolastbwa.com y pressstartevolution.com.
// ======================================================

// Lista blanca de orígenes permitidos
$allowed_origins = [
    'https://test.denicolastbwa.com',
    'https://www.pressstartevolution.com'
];

// Detectar el origen de la petición
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Si el origen está permitido, agregar los encabezados CORS
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

// Encabezados CORS estándar
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400"); // cache del preflight: 24h

// Manejo del preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
