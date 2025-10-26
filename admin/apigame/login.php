<?php
include 'configDB/connect.php';
include 'configDB/auth.php';
include 'utils/header.php';
include 'utils/const.php';

use phps\Utils\Constantes;

require_auth();

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function resolveProjectRoot(): string
{
    $defaultRoot = dirname(__DIR__);

    if (class_exists(Constantes::class)) {
        $configuredRoot = rtrim(Constantes::server_path ?? '', "/\\");
        if (!empty($configuredRoot) && is_dir($configuredRoot)) {
            return $configuredRoot;
        }
    }

    return $defaultRoot;
}

function storeFacturaImage(string $encodedImage, string $destinationDir): array
{
    if ($encodedImage === '') {
        return [null, 'La imagen de la factura es obligatoria.'];
    }

    $mime = null;
    $dataPart = $encodedImage;

    if (preg_match('/^data:(.*?);base64,(.*)$/', $encodedImage, $matches)) {
        $mime = strtolower(trim($matches[1]));
        $dataPart = $matches[2];
    }

    $binary = base64_decode(str_replace(' ', '+', $dataPart), true);
    if ($binary === false) {
        return [null, 'La imagen de la factura no es valida.'];
    }

    $knownMime = $mime;
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_buffer($finfo, $binary);
            if ($detected !== false) {
                $knownMime = strtolower($detected);
            }
            finfo_close($finfo);
        }
    }

    $extensions = [
        'image/jpeg' => 'jpg',
        'image/jpg'  => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];

    $extension = $knownMime && isset($extensions[$knownMime])
        ? $extensions[$knownMime]
        : 'bin';

    if (!is_dir($destinationDir) && !mkdir($destinationDir, 0755, true) && !is_dir($destinationDir)) {
        return [null, 'No fue posible preparar el directorio para guardar la factura.'];
    }

    $filename = 'factura_' . str_replace('.', '', uniqid('', true)) . '.' . $extension;
    $filePath = $destinationDir . DIRECTORY_SEPARATOR . $filename;

    if (file_put_contents($filePath, $binary) === false) {
        return [null, 'No fue posible guardar la imagen de la factura.'];
    }

    return [$filename, null];
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || $rawBody === '') {
    respond(400, ['error' => 'El cuerpo de la solicitud esta vacío.']);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    respond(400, ['error' => 'El cuerpo de la solicitud no es un JSON válido.']);
}

$correo = strtolower(trim($payload['correo'] ?? ''));
$lugarCompra = trim($payload['lugar_compra'] ?? '');
$numeroFactura = trim($payload['numero_factura'] ?? '');
$fotoFactura = $payload['foto_factura'] ?? '';

if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['error' => 'El correo es obligatorio y debe tener un formato válido.']);
}

if ($lugarCompra === '') {
    respond(400, ['error' => 'El lugar de compra es obligatorio.']);
}

if ($numeroFactura === '') {
    respond(400, ['error' => 'El número de la factura es obligatorio.']);
}

if ($fotoFactura === '') {
    respond(400, ['error' => 'La foto de la factura es obligatoria.']);
}

$stmtUser = $conexion->prepare('SELECT id_user_game, nickname FROM users_game WHERE correo = ? LIMIT 1');
if ($stmtUser === false) {
    respond(500, ['error' => 'No fue posible preparar la consulta del usuario.']);
}
$stmtUser->bind_param('s', $correo);
$stmtUser->execute();
$stmtUser->bind_result($userId, $nickname);
if (!$stmtUser->fetch()) {
    $stmtUser->close();
    respond(404, ['error' => 'No existe un usuario asociado a ese correo.']);
}
$stmtUser->close();

$stmtFacturaUnique = $conexion->prepare('SELECT 1 FROM facturas WHERE numero_factura = ? AND lugar_compra = ? LIMIT 1');
if ($stmtFacturaUnique === false) {
    respond(500, ['error' => 'No fue posible validar el número de factura.']);
}
$stmtFacturaUnique->bind_param('ss', $numeroFactura, $lugarCompra);
$stmtFacturaUnique->execute();
$stmtFacturaUnique->store_result();
if ($stmtFacturaUnique->num_rows > 0) {
    $stmtFacturaUnique->close();
    respond(409, ['error' => 'El número de factura ya se encuentra registrado para ese lugar de compra.']);
}
$stmtFacturaUnique->close();

if (!$conexion->begin_transaction()) {
    respond(500, ['error' => 'No fue posible iniciar la transacción.']);
}

$projectRoot = resolveProjectRoot();
$facturasDir = $projectRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'facturas';
$storedFileName = null;

try {
    [$storedFileName, $fileError] = storeFacturaImage((string)$fotoFactura, $facturasDir);
    if ($fileError !== null) {
        throw new RuntimeException($fileError);
    }

    $stmtInsertFactura = $conexion->prepare(
        'INSERT INTO facturas (lugar_compra, numero_factura, foto_factura, fecha_registro, estado, id_user_game)
         VALUES (?, ?, ?, NOW(), 1, ?)'
    );
    if ($stmtInsertFactura === false) {
        throw new RuntimeException('No fue posible preparar el registro de la factura.');
    }

    $stmtInsertFactura->bind_param('sssi', $lugarCompra, $numeroFactura, $storedFileName, $userId);
    if (!$stmtInsertFactura->execute()) {
        $err = $stmtInsertFactura->error ?: 'Error desconocido al ejecutar el INSERT de factura.';
        $stmtInsertFactura->close();
        throw new RuntimeException('No fue posible registrar la factura: ' . $err);
    }
    $facturaId = $conexion->insert_id;
    $stmtInsertFactura->close();

    $stmtUpdateLogin = $conexion->prepare('UPDATE users_game SET last_login = NOW() WHERE id_user_game = ?');
    if ($stmtUpdateLogin !== false) {
        $stmtUpdateLogin->bind_param('i', $userId);
        $stmtUpdateLogin->execute();
        $stmtUpdateLogin->close();
    }

    $conexion->commit();

    respond(201, [
        'message' => 'Factura registrada correctamente.',
        'id_user_game' => $userId,
        'id_factura' => $facturaId,
        // 'foto_factura' => $storedFileName,
        'nickname' => $nickname,
    ]);
} catch (Throwable $exception) {
    $conexion->rollback();
    if ($storedFileName !== null) {
        $storedPath = $facturasDir . DIRECTORY_SEPARATOR . $storedFileName;
        if (is_file($storedPath)) {
            @unlink($storedPath);
        }
    }
    respond(500, ['error' => $exception->getMessage()]);
}
