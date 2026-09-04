<?php
// api/lms/download.php
// DEPRECATED: Redirecting to central protected download gateway
$id = $_GET['id'] ?? null;
$expires = $_GET['expires'] ?? 0;
$signature = $_GET['signature'] ?? '';

if (!$id) {
    http_response_code(400);
    die("Resource ID required");
}

$queryParams = http_build_query([
    'lib_id' => $id,
    'expires' => $expires,
    'signature' => $signature,
    'mode' => $_GET['mode'] ?? 'download'
]);

header("Location: ../download.php?$queryParams");
exit;
