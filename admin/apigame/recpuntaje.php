<?php
include 'configDB/connect.php';
include 'configDB/auth.php';
include 'utils/header.php';

require_auth();

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function normalizeDate(?string $value): ?string
{
    if ($value === null || $value === '') {
        return null;
    }

    $value = trim($value);

    // Accept format Y-m-d H:i:s directly.
    $dt = DateTime::createFromFormat('Y-m-d H:i:s', $value);
    if ($dt !== false) {
        return $dt->format('Y-m-d H:i:s');
    }

    // Try ISO 8601 (e.g., 2025-10-16T06:26:30.309Z).
    try {
        $dt = new DateTime($value);
        return $dt->format('Y-m-d H:i:s');
    } catch (Exception $exception) {
        return null;
    }
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || $rawBody === '') {
    respond(400, ['error' => 'El cuerpo de la solicitud esta vacio.']);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    respond(400, ['error' => 'El cuerpo de la solicitud no es un JSON valido.']);
}

$idUserGame = $payload['id_user_game'] ?? null;
$idFactura = $payload['id_factura'] ?? null;
$puntaje = $payload['puntaje'] ?? null;
$tiempoJugado = $payload['tiempo_jugado'] ?? null;
$vidasRestantes = $payload['vidas_restantes'] ?? null;
$fechaInicio = $payload['fecha_inicio'] ?? null;
$fechaFin = $payload['fecha_fin'] ?? null;

if ($idUserGame === null || !is_numeric($idUserGame) || (int)$idUserGame <= 0) {
    respond(400, ['error' => 'El id del usuario es obligatorio y debe ser un numero positivo.']);
}
$idUserGame = (int)$idUserGame;

if ($idFactura !== null && $idFactura !== '' && (!is_numeric($idFactura) || (int)$idFactura <= 0)) {
    respond(400, ['error' => 'El id de la factura debe ser un numero positivo cuando se suministra.']);
}
$idFactura = ($idFactura === null || $idFactura === '' || (int)$idFactura === 0) ? null : (int)$idFactura;

if ($puntaje === null || !is_numeric($puntaje)) {
    respond(400, ['error' => 'El puntaje es obligatorio y debe ser numerico.']);
}
$puntaje = (int)$puntaje;

if ($tiempoJugado !== null && $tiempoJugado !== '' && !is_numeric($tiempoJugado)) {
    respond(400, ['error' => 'El tiempo jugado debe ser numerico cuando se suministra.']);
}
$tiempoJugado = ($tiempoJugado === null || $tiempoJugado === '') ? null : (int)$tiempoJugado;

if ($vidasRestantes !== null && $vidasRestantes !== '' && !is_numeric($vidasRestantes)) {
    respond(400, ['error' => 'Las vidas restantes deben ser numericas cuando se suministran.']);
}
$vidasRestantes = ($vidasRestantes === null || $vidasRestantes === '') ? null : (int)$vidasRestantes;

$fechaInicio = normalizeDate($fechaInicio);
if ($fechaInicio === null && isset($payload['fecha_inicio']) && $payload['fecha_inicio'] !== '') {
    respond(400, ['error' => 'La fecha de inicio debe tener el formato Y-m-d H:i:s o ISO8601.']);
}

$fechaFin = normalizeDate($fechaFin);
if ($fechaFin === null && isset($payload['fecha_fin']) && $payload['fecha_fin'] !== '') {
    respond(400, ['error' => 'La fecha de fin debe tener el formato Y-m-d H:i:s o ISO8601.']);
}

$stmtUser = $conexion->prepare('SELECT 1 FROM users_game WHERE id_user_game = ? LIMIT 1');
if ($stmtUser === false) {
    respond(500, ['error' => 'No fue posible validar el usuario.']);
}
$stmtUser->bind_param('i', $idUserGame);
$stmtUser->execute();
$stmtUser->store_result();
if ($stmtUser->num_rows === 0) {
    $stmtUser->close();
    respond(404, ['error' => 'El usuario no existe.']);
}
$stmtUser->close();

if ($idFactura !== null) {
    $stmtFactura = $conexion->prepare('SELECT 1 FROM facturas WHERE id_factura = ? LIMIT 1');
    if ($stmtFactura === false) {
        respond(500, ['error' => 'No fue posible validar la factura.']);
    }
    $stmtFactura->bind_param('i', $idFactura);
    $stmtFactura->execute();
    $stmtFactura->store_result();
    if ($stmtFactura->num_rows === 0) {
        $stmtFactura->close();
        respond(404, ['error' => 'La factura indicada no existe.']);
    }
    $stmtFactura->close();
}

$stmtInsert = $conexion->prepare(
    'INSERT INTO puntajes (id_user_game, id_factura, puntaje, tiempo_jugado, vidas_restantes, fecha_inicio, fecha_fin, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())'
);

if ($stmtInsert === false) {
    respond(500, ['error' => 'No fue posible preparar el registro del puntaje.']);
}

$stmtInsert->bind_param(
    'iiiiiss',
    $idUserGame,
    $idFactura,
    $puntaje,
    $tiempoJugado,
    $vidasRestantes,
    $fechaInicio,
    $fechaFin
);

try {
    $stmtInsert->execute();
    $puntajeId = $stmtInsert->insert_id;
    $stmtInsert->close();

    respond(201, [
        'message' => 'Puntaje registrado correctamente.',
        // 'id_puntaje' => $puntajeId,
        // 'id_user_game' => $idUserGame,
        // 'id_factura' => $idFactura,
    ]);
} catch (Throwable $exception) {
    $stmtInsert->close();
    respond(500, ['error' => $exception->getMessage()]);
}
