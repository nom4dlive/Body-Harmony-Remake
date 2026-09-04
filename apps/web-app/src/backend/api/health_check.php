<?php
// Simple Health Check
header('Content-Type: application/json');
echo json_encode(['status' => 'ok', 'timestamp' => time()]);
