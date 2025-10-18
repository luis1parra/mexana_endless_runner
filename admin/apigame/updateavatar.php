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

$rawBody = file_get_contents('php://input');
if ($rawBody === false || $rawBody === '') {
    respond(400, ['error' => 'El cuerpo de la solicitud esta vacio.']);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    respond(400, ['error' => 'El cuerpo de la solicitud no es un JSON valido.']);
}

$idUserGame = $payload['id_user_game'] ?? null;
$avatar = $payload['avatar'] ?? null;

if ($idUserGame === null || !is_numeric($idUserGame) || (int)$idUserGame <= 0) {
    respond(400, ['error' => 'El parametro id_user_game es obligatorio y debe ser un numero positivo.']);
}
$idUserGame = (int)$idUserGame;

$avatar = strtoupper(trim((string)$avatar));
$allowedAvatars = ['H', 'M'];

if (!in_array($avatar, $allowedAvatars, true)) {
    respond(400, ['error' => 'El avatar es obligatorio y debe ser H o M.']);
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
    respond(404, ['error' => 'El usuario indicado no existe.']);
}

$stmtUser->close();

$stmtUpdate = $conexion->prepare('UPDATE users_game SET avatar = ? WHERE id_user_game = ?');
if ($stmtUpdate === false) {
    respond(500, ['error' => 'No fue posible actualizar el avatar.']);
}

$stmtUpdate->bind_param('si', $avatar, $idUserGame);

try {
    $stmtUpdate->execute();
    $stmtUpdate->close();

    respond(200, [
        'message' => 'Avatar actualizado correctamente.',
        // 'id_user_game' => $idUserGame,
        // 'avatar' => $avatar,
    ]);
} catch (Throwable $exception) {
    $stmtUpdate->close();
    respond(500, ['error' => $exception->getMessage()]);
}
