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
if (!is_array($payload) || !isset($payload['id_user_game'])) {
    respond(400, ['error' => 'El parametro id_user_game es obligatorio.']);
}

$idUserGame = $payload['id_user_game'];
if (!is_numeric($idUserGame) || (int)$idUserGame <= 0) {
    respond(400, ['error' => 'El parametro id_user_game debe ser un numero positivo.']);
}
$idUserGame = (int)$idUserGame;

$stmtUser = $conexion->prepare("
    SELECT 
        ug.id_user_game,
        ug.avatar,
        ug.nickname,
        COALESCE(SUM(p.puntaje), 0) AS total_puntaje
    FROM users_game ug
    LEFT JOIN puntajes p ON p.id_user_game = ug.id_user_game
    WHERE ug.id_user_game = ?
    GROUP BY ug.id_user_game
    LIMIT 1
");

if ($stmtUser === false) {
    respond(500, ['error' => 'No fue posible obtener la informacion del usuario.']);
}

$stmtUser->bind_param('i', $idUserGame);
$stmtUser->execute();
$userResult = $stmtUser->get_result();

if ($userResult === false || $userResult->num_rows === 0) {
    $stmtUser->close();
    respond(404, ['error' => 'El usuario indicado no existe.']);
}

$userRow = $userResult->fetch_assoc();
$stmtUser->close();

$totalPuntaje = (int)$userRow['total_puntaje'];
$avatar = $userRow['avatar'];
$nickname = $userRow['nickname'];

$stmtLastScore = $conexion->prepare("
    SELECT puntaje
    FROM puntajes
    WHERE id_user_game = ?
    ORDER BY creado_en DESC, id_puntaje DESC
    LIMIT 1
");

if ($stmtLastScore === false) {
    respond(500, ['error' => 'No fue posible obtener el ultimo puntaje.']);
}

$stmtLastScore->bind_param('i', $idUserGame);
$stmtLastScore->execute();
$stmtLastScore->bind_result($lastScore);
$hasLastScore = $stmtLastScore->fetch();
$stmtLastScore->close();

$lastScore = $hasLastScore ? (int)$lastScore : 0;

$stmtRank = $conexion->prepare("
    SELECT COUNT(*) + 1 AS posicion
    FROM (
        SELECT 
            ug.id_user_game,
            COALESCE(SUM(p.puntaje), 0) AS total_puntaje
        FROM users_game ug
        LEFT JOIN puntajes p ON p.id_user_game = ug.id_user_game
        GROUP BY ug.id_user_game
    ) AS resumen
    WHERE total_puntaje > ?
       OR (total_puntaje = ? AND id_user_game < ?)
");

if ($stmtRank === false) {
    respond(500, ['error' => 'No fue posible calcular la posicion.']);
}

$stmtRank->bind_param('iii', $totalPuntaje, $totalPuntaje, $idUserGame);
$stmtRank->execute();
$stmtRank->bind_result($position);
$stmtRank->fetch();
$stmtRank->close();

respond(200, [
    'posicion' => (int)$position,
    'avatar' => $avatar,
    'nickname' => $nickname,
    'sumatoria' => $totalPuntaje,
    'puntaje' => $lastScore,
]);
