<?php
include 'configDB/connect.php';
include 'configDB/auth.php';
include 'utils/header.php';

require_auth();

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
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
if ($idUserGame === null || !is_numeric($idUserGame) || (int)$idUserGame <= 0) {
    respond(400, ['error' => 'El parametro id_user_game es obligatorio y debe ser un numero positivo.']);
}
$idUserGame = (int)$idUserGame;

$idFacturaRaw = $payload['id_factura'] ?? null;
$idFactura = null;
if ($idFacturaRaw !== null && $idFacturaRaw !== '' && $idFacturaRaw !== 0) {
    if (!is_numeric($idFacturaRaw) || (int)$idFacturaRaw <= 0) {
        respond(400, ['error' => 'El parametro id_factura debe ser un numero positivo.']);
    }
    $idFactura = (int)$idFacturaRaw;
}

$estado = 'rechazada';
$baseSql = '
    SELECT f.id_factura, f.numero_factura, f.fecha_validacion
    FROM facturas f
    INNER JOIN estados_factura e ON e.id_estado_factura = f.estado
    WHERE f.id_user_game = ? AND e.valor = ? AND f.fecha_validacion IS NOT NULL
      AND f.fecha_validacion >= (NOW() - INTERVAL 5 MINUTE)
';
if ($idFactura !== null) {
    $baseSql .= ' AND f.id_factura = ?';
}
$baseSql .= '
    ORDER BY f.fecha_validacion DESC
    LIMIT 1';

$stmt = $conexion->prepare($baseSql);

if ($stmt === false) {
    respond(500, ['error' => 'No fue posible preparar la consulta.']);
}

if ($idFactura !== null) {
    $stmt->bind_param('isi', $idUserGame, $estado, $idFactura);
} else {
    $stmt->bind_param('is', $idUserGame, $estado);
}
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $stmt->close();

    respond(200, [
        'rejected' => true,
        'factura' => [
            'id_factura' => (int)$row['id_factura'],
            'numero_factura' => $row['numero_factura'],
            'fecha_validacion' => $row['fecha_validacion'],
        ],
        'checked_at' => date('Y-m-d H:i:s'),
    ]);
}

$stmt->close();
respond(200, ['rejected' => false, 'checked_at' => date('Y-m-d H:i:s')]);
