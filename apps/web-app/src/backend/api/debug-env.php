<?php
// DEBUG ENDPOINT - DELETE AFTER TESTING
// Purpose: Verify .env file location and parser execution
// STANDALONE - Does not require config.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$debugInfo = [
    'timestamp' => date('Y-m-d H:i:s'),
    'current_dir' => __DIR__,
    'script_path' => __FILE__,
    'env_paths_tested' => [],
    'env_file_found' => false,
    'env_file_path' => null,
    'env_file_readable' => false,
    'env_file_size' => null,
    'env_file_contents_preview' => null,
    'env_vars_parsed' => [],
    'getenv_before' => [
        'DB_HOST' => getenv('DB_HOST') ?: 'NOT SET',
        'DB_NAME' => getenv('DB_NAME') ?: 'NOT SET',
        'DB_USER' => getenv('DB_USER') ?: 'NOT SET',
        'DB_PASS' => getenv('DB_PASS') ? 'SET (hidden)' : 'NOT SET',
    ],
];

// Test multiple .env locations
$envPaths = [
    __DIR__ . '/.env',                    // Same directory
    dirname(__DIR__) . '/.env',           // Parent directory
    dirname(__DIR__, 2) . '/.env',        // 2 levels up
    dirname(__DIR__, 3) . '/.env',        // 3 levels up
    '/home/u388974772/public_html/api/.env',  // Absolute path (Hostinger)
];

foreach ($envPaths as $path) {
    $exists = file_exists($path);
    $readable = $exists && is_readable($path);
    $size = $exists ? filesize($path) : 0;
    
    $debugInfo['env_paths_tested'][] = [
        'path' => $path,
        'exists' => $exists,
        'readable' => $readable,
        'size' => $size,
    ];
    
    if ($exists && $readable && !$debugInfo['env_file_found']) {
        $debugInfo['env_file_found'] = true;
        $debugInfo['env_file_path'] = $path;
        $debugInfo['env_file_readable'] = true;
        $debugInfo['env_file_size'] = $size;
        
        // Read first 5 lines for preview (hide values)
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $preview = [];
        foreach (array_slice($lines, 0, 5) as $line) {
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $preview[] = trim($key) . '=***';
            } else {
                $preview[] = $line;
            }
        }
        $debugInfo['env_file_contents_preview'] = $preview;
        
        // Parse all variables
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || $line[0] === '#') {
                continue;
            }
            
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $debugInfo['env_vars_parsed'][] = $key;
            }
        }
    }
}

// Test if we can manually load .env
if ($debugInfo['env_file_found']) {
    $testPath = $debugInfo['env_file_path'];
    $lines = file($testPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || $line[0] === '#') {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
    
    $debugInfo['manual_load_attempted'] = true;
    $debugInfo['getenv_after'] = [
        'DB_HOST' => getenv('DB_HOST') ?: 'NOT SET',
        'DB_NAME' => getenv('DB_NAME') ?: 'NOT SET',
        'DB_USER' => getenv('DB_USER') ?: 'NOT SET',
        'DB_PASS' => getenv('DB_PASS') ? 'SET (hidden)' : 'NOT SET',
    ];
} else {
    $debugInfo['manual_load_attempted'] = false;
    $debugInfo['error'] = 'No .env file found in any tested location';
}

echo json_encode($debugInfo, JSON_PRETTY_PRINT);
