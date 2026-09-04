<?php
// EMERGENCY DEBUG - COMPLETELY STANDALONE
// Access via: https://bodyharmony.com.br/api/EMERGENCY_ENV_DEBUG.php

// Prevent any auto-loading
define('NO_CONFIG', true);

header('Content-Type: text/plain');
echo "=== EMERGENCY ENV DEBUG ===\n\n";

echo "1. Current Directory:\n";
echo "   " . __DIR__ . "\n\n";

echo "2. Script Path:\n";
echo "   " . __FILE__ . "\n\n";

echo "3. Testing .env locations:\n";
$envPaths = [
    __DIR__ . '/.env',
    dirname(__DIR__) . '/.env',
    '/home/u388974772/public_html/api/.env',
    '/home/u388974772/domains/bodyharmony.com.br/public_html/api/.env',
];

foreach ($envPaths as $path) {
    $exists = file_exists($path);
    $readable = $exists && is_readable($path);
    $size = $exists ? filesize($path) : 0;
    
    echo "   Path: $path\n";
    echo "   Exists: " . ($exists ? 'YES' : 'NO') . "\n";
    echo "   Readable: " . ($readable ? 'YES' : 'NO') . "\n";
    echo "   Size: $size bytes\n";
    
    if ($exists && $readable) {
        echo "   ✅ FOUND!\n";
        echo "   First 3 lines:\n";
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach (array_slice($lines, 0, 3) as $i => $line) {
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                echo "      " . ($i+1) . ". " . trim($key) . "=***\n";
            } else {
                echo "      " . ($i+1) . ". $line\n";
            }
        }
        echo "\n   Total lines: " . count($lines) . "\n";
        break;
    }
    echo "\n";
}

echo "\n4. getenv() before loading:\n";
echo "   DB_HOST: " . (getenv('DB_HOST') ?: 'NOT SET') . "\n";
echo "   DB_NAME: " . (getenv('DB_NAME') ?: 'NOT SET') . "\n";
echo "   DB_USER: " . (getenv('DB_USER') ?: 'NOT SET') . "\n";
echo "   DB_PASS: " . (getenv('DB_PASS') ? 'SET' : 'NOT SET') . "\n";

echo "\n=== END DEBUG ===\n";
