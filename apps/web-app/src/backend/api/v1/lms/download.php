<?php
// api/v1/lms/download.php
// DEPRECATED: Redirecting to central protected download gateway
$id = $_GET['id'] ?? null;
$token = $_GET['token'] ?? null;

if (!$id) {
    http_response_code(400);
    die("File ID required");
}

$queryParams = http_build_query([
    'file_id' => $id,
    'token' => $token,
    'mode' => $_GET['mode'] ?? 'download'
]);

// Redirect to main gateway two levels up
header("Location: ../../download.php?$queryParams");
exit;
