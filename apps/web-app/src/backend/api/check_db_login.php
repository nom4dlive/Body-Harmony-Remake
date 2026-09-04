<?php
// api/check_db_login.php
// Diagnostic tool to verify DB connection and Login logic independently

header('Content-Type: text/plain');

echo "--- DATABASE DIAGNOSTIC TOOL ---\n";
echo "Timestamp: " . date('Y-m-d H:i:s') . "\n\n";

// 1. Load Credentials (Manual parsing to identical .env logic)
$envPaths = [
    __DIR__ . '/.env',
    dirname(__DIR__) . '/.env',
    dirname(__DIR__, 3) . '/.env',
    dirname(__DIR__, 4) . '/.env'
];
$envPath = null;
foreach ($envPaths as $path) {
    if (file_exists($path) && is_readable($path)) {
        $envPath = $path;
        break;
    }
}
if (!$envPath) {
    die("FATAL: .env file not found in paths: " . implode(', ', $envPaths));
}

$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line) || $line[0] === '#') continue;
    if (strpos($line, '=') !== false) {
        list($k, $v) = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v);
        if (preg_match('/^"(.*)"$/', $v, $m)) $v = $m[1];
        elseif (preg_match("/^'(.*)'$/", $v, $m)) $v = $m[1];
        $env[$k] = $v;
    }
}

$host = $env['DB_HOST'] ?? 'Unknown';
$user = $env['DB_USER'] ?? 'Unknown';
$pass = $env['DB_PASS'] ?? 'Unknown';
$name = $env['DB_NAME'] ?? 'Unknown';

echo "1. Configuration:\n";
echo "   Host: $host\n";
echo "   User: $user\n";
echo "   DB:   $name\n";
echo "   Pass: " . substr($pass, 0, 3) . "***" . substr($pass, -3) . "\n\n";

// 2. Test Connection
echo "2. Testing Connection...\n";
try {
    $pdo = new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "   ✅ Connection Successful!\n\n";
} catch (PDOException $e) {
    echo "   ❌ Connection FAILED: " . $e->getMessage() . "\n";
    echo "   ⚠️  DIAGNOSIS: If this says 'max_connections_per_hour', YOU ARE BLOCKED. WAIT 1 HOUR.\n";
    exit;
}

// 3. Test 'nom4d' User
echo "3. Verifying User 'nom4d'...\n";
$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
$stmt->execute(['nom4d']);
$admin = $stmt->fetch();

if (!$admin) {
    echo "   ❌ User 'nom4d' NOT FOUND in database.\n";
} else {
    echo "   ✅ User found (ID: " . $admin['id'] . ", Role: " . $admin['role'] . ")\n";
    echo "   Hash in DB: " . substr($admin['password_hash'], 0, 10) . "...\n";
    
    // 4. Test Password Verify
    echo "   Testing password 'nom4d010203'...\n";
    if (password_verify('nom4d010203', $admin['password_hash'])) {
        echo "   ✅ Password VERIFIED matches hash.\n";
    } else {
         echo "   ❌ Password verify FAILED.\n";
         echo "       -> Hashing 'nom4d010203' generates: " . password_hash('nom4d010203', PASSWORD_DEFAULT) . "\n";
    }
}
?>
