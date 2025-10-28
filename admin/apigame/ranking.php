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

$idUserParam = null;
$limitParam = null;
$rawBody = file_get_contents('php://input');
$payload = null;

if ($rawBody !== false && $rawBody !== '') {
    $decoded = json_decode($rawBody, true);
    if (is_array($decoded)) {
        $payload = $decoded;
    }
}

if (isset($_GET['id_user_game']) && $_GET['id_user_game'] !== '') {
    $idUserParam = $_GET['id_user_game'];
} elseif ($payload !== null && isset($payload['id_user_game']) && $payload['id_user_game'] !== '') {
    $idUserParam = $payload['id_user_game'];
}

if (isset($_GET['n']) && $_GET['n'] !== '') {
    $limitParam = $_GET['n'];
} elseif ($payload !== null && isset($payload['n']) && $payload['n'] !== '') {
    $limitParam = $payload['n'];
}

if ($idUserParam !== null) {
    if (!is_numeric($idUserParam) || (int)$idUserParam <= 0) {
        respond(400, ['error' => 'El parametro id_user_game debe ser un numero positivo.']);
    }
    $idUserParam = (int)$idUserParam;
}

if ($limitParam !== null) {
    if (!is_numeric($limitParam) || (int)$limitParam <= 0) {
        respond(400, ['error' => 'El parametro n debe ser un numero positivo.']);
    }
    $limitParam = (int)$limitParam;
}

$rankingLimit = $limitParam ?? 10;

$topScoresSql = "
    SELECT 
        ug.id_user_game,
        ug.avatar,
        ug.nickname,
        COALESCE(SUM(CASE WHEN f.estado <> 3 THEN p.puntaje ELSE 0 END), 0) AS total_puntaje
    FROM users_game ug
    LEFT JOIN puntajes p ON p.id_user_game = ug.id_user_game
    LEFT JOIN facturas f ON f.id_factura = p.id_factura
    GROUP BY ug.id_user_game
    ORDER BY total_puntaje DESC, ug.id_user_game ASC
    LIMIT " . $rankingLimit;

$result = $conexion->query($topScoresSql);
if ($result === false) {
    respond(500, ['error' => 'No fue posible obtener el ranking.']);
}

$ranking = [];
$position = 1;
$selectedFound = false;

while ($row = $result->fetch_assoc()) {
    $isSelected = $idUserParam !== null && (int)$row['id_user_game'] === $idUserParam;
    if ($isSelected) {
        $selectedFound = true;
    }
    $entry = [
        'posicion' => $position,
        'avatar' => $row['avatar'],
        'nickname' => $row['nickname'],
        'sumatoria' => (int)$row['total_puntaje'],
    ];

    if ($idUserParam !== null) {
        $entry['selected'] = $isSelected;
    }

    $ranking[] = $entry;
    $position++;
}
$result->free();

if ($idUserParam !== null && !$selectedFound) {
    $stmtUser = $conexion->prepare("
        SELECT 
            ug.id_user_game,
            ug.avatar,
            ug.nickname,
            COALESCE(SUM(CASE WHEN f.estado <> 3 THEN p.puntaje ELSE 0 END), 0) AS total_puntaje
        FROM users_game ug
        LEFT JOIN puntajes p ON p.id_user_game = ug.id_user_game
        LEFT JOIN facturas f ON f.id_factura = p.id_factura
        WHERE ug.id_user_game = ?
        GROUP BY ug.id_user_game
        LIMIT 1
    ");

    if ($stmtUser === false) {
        respond(500, ['error' => 'No fue posible obtener la informacion del jugador solicitado.']);
    }

    $stmtUser->bind_param('i', $idUserParam);
    $stmtUser->execute();
    $userResult = $stmtUser->get_result();

    if ($userResult === false || $userResult->num_rows === 0) {
        $stmtUser->close();
        respond(404, ['error' => 'El jugador indicado no existe.']);
    }

    $userRow = $userResult->fetch_assoc();
    $stmtUser->close();
    $userId = (int)$userRow['id_user_game'];
    $userTotal = (int)$userRow['total_puntaje'];

    $stmtRank = $conexion->prepare("
        SELECT COUNT(*) + 1 AS posicion
        FROM (
            SELECT 
                ug.id_user_game,
                COALESCE(SUM(CASE WHEN f.estado <> 3 THEN p.puntaje ELSE 0 END), 0) AS total_puntaje
            FROM users_game ug
            LEFT JOIN puntajes p ON p.id_user_game = ug.id_user_game
            LEFT JOIN facturas f ON f.id_factura = p.id_factura
            GROUP BY ug.id_user_game
        ) AS resumen
        WHERE total_puntaje > ?
           OR (total_puntaje = ? AND id_user_game < ?)
    ");

    if ($stmtRank === false) {
        respond(500, ['error' => 'No fue posible calcular la posicion del jugador.']);
    }

    $stmtRank->bind_param('iii', $userTotal, $userTotal, $userId);
    $stmtRank->execute();
    $stmtRank->bind_result($userPosition);
    $stmtRank->fetch();
    $stmtRank->close();

    $ranking[] = [
        'posicion' => (int)$userPosition,
        'avatar' => $userRow['avatar'],
        'nickname' => $userRow['nickname'],
        'sumatoria' => $userTotal,
        'selected' => true,
    ];
}

respond(200, [
    'ranking' => $ranking,
]);
