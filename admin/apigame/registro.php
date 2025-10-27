<?php
include 'configDB/connect.php';
include 'configDB/auth.php';
include 'utils/header.php';
include 'utils/const.php';

use phps\Utils\Constantes;

require_auth();

/**
 * Sends a JSON response and stops script execution.
 *
 * @param int   $statusCode
 * @param array $payload
 */
function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

/**
 * Try to resolve the absolute path to the project root.
 *
 * @return string
 */
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

/**
 * Stores the factura image on disk and returns the stored filename.
 *
 * @param string $encodedImage
 * @param string $destinationDir
 *
 * @return array{0:?string,1:?string} [filename, errorMessage]
 */
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
        return [null, 'La imagen de la factura no es válida.'];
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

    // echo "filePath" . $filePath;

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

$nombre = trim($payload['nombre'] ?? '');
$apellido = trim($payload['apellido'] ?? '');
$correo = strtolower(trim($payload['correo'] ?? ''));
$nickname = trim($payload['nickname'] ?? '');
$edad = $payload['edad'] ?? null;
$genero = strtoupper(trim($payload['genero'] ?? ''));
$lugarCompra = trim($payload['lugar_compra'] ?? '');
$numeroFactura = trim($payload['numero_factura'] ?? '');
$fotoFactura = $payload['foto_factura'] ?? '';

if ($nombre === '') {
    respond(400, ['error' => 'El nombre es obligatorio.']);
}

if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['error' => 'El correo es obligatorio y debe tener un formato válido.']);
}

if ($nickname === '') {
    respond(400, ['error' => 'El nickname es obligatorio.']);
}

if ($edad === null || !is_numeric($edad) || (int)$edad < 0) {
    respond(400, ['error' => 'La edad es obligatoria y debe ser un número positivo.']);
}

$edad = (int)$edad;

$generosPermitidos = ['M', 'F', 'NB', 'O'];
if ($genero === '' || !in_array($genero, $generosPermitidos, true)) {
    respond(400, ['error' => 'El género es obligatorio y debe ser uno de: M, F, NB, O.']);
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

$apellido = $apellido === '' ? '' : $apellido;

// Validar unicidad de correo.
$stmtCorreo = $conexion->prepare('SELECT 1 FROM users_game WHERE correo = ? LIMIT 1');
if ($stmtCorreo === false) {
    respond(500, ['error' => 'No fue posible preparar la validación de correo.']);
}
$stmtCorreo->bind_param('s', $correo);
$stmtCorreo->execute();
$stmtCorreo->store_result();
if ($stmtCorreo->num_rows > 0) {
    $stmtCorreo->close();
    respond(409, ['error' => 'El correo ya se encuentra registrado.']);
}
$stmtCorreo->close();

// Validar unicidad de nickname.
$stmtNickname = $conexion->prepare('SELECT 1 FROM users_game WHERE nickname = ? LIMIT 1');
if ($stmtNickname === false) {
    respond(500, ['error' => 'No fue posible preparar la validación de nickname.']);
}
$stmtNickname->bind_param('s', $nickname);
$stmtNickname->execute();
$stmtNickname->store_result();
if ($stmtNickname->num_rows > 0) {
    $stmtNickname->close();
    respond(409, ['error' => 'El nickname ya se encuentra registrado.']);
}
$stmtNickname->close();

// Validar unicidad de la factura por combinacion (lugar_compra + numero_factura).
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
$facturaId = null;

try {
    $stmtInsertUser = $conexion->prepare(
        'INSERT INTO users_game (nombre, apellido, nickname, edad, genero, correo, avatar, last_login, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())'
    );
    if ($stmtInsertUser === false) {
        throw new RuntimeException('No fue posible preparar el registro del usuario.');
    }

    $stmtInsertUser->bind_param('sssiss', $nombre, $apellido, $nickname, $edad, $genero, $correo);
    if (!$stmtInsertUser->execute()) {
        $err = $stmtInsertUser->error ?: 'Error desconocido al ejecutar el INSERT del usuario.';
        $stmtInsertUser->close();
        throw new RuntimeException('No fue posible registrar al usuario: ' . $err);
    }
    $userId = $conexion->insert_id;
    $stmtInsertUser->close();

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

    $conexion->commit();

    respond(201, [
        'message' => 'Registro completado correctamente.',
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
