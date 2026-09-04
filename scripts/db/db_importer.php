<?php
// scripts/db/db_importer.php

header('Content-Type: text/plain');

$host = 'auth-db795.hstgr.io'; // From user string
$user = 'u388974772_teste';    // From user string
$pass = 'Senha010203*';        // From user string
$db   = 'u388974772_test';     // From user string

echo "Starting DB Import Process...\n";

// 1. Connect
$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    die("❌ Connection Failed: " . $mysqli->connect_error);
}
echo "✅ Connected to $db\n";

// 2. Read SQL File
$sqlFile = __DIR__ . '/import.sql';
if (!file_exists($sqlFile)) {
    die("❌ SQL File Not Found: $sqlFile");
}
$sql = file_get_contents($sqlFile);
if (!$sql) {
    die("❌ Empty or Unreadable SQL File");
}
echo "✅ Loaded SQL File (" . strlen($sql) . " bytes)\n";

// 3. Pre-process SQL (Optional: remove CREATE DATABASE if exists)
// The dump has "CREATE DATABASE ... USE ...". We might need to strip that if user lacks perm to create DBs or if we want to force usage of current DB.
// Simple hack: Remove lines starting with CREATE DATABASE and USE if they cause issues, but `multi_query` handle might be tricky if it changes DB context.
// Let's try to strip `USE` commands to ensure we stay in the connected DB.
$sql = preg_replace('/^USE `[^`]+`;/m', '', $sql);
$sql = preg_replace('/^CREATE DATABASE [^;]+;/m', '', $sql);

// 4. Execute Multi Query
echo "⏳ Executing Queries... (This may take a moment)\n";
if ($mysqli->multi_query($sql)) {
    do {
        // Store first result
        if ($result = $mysqli->store_result()) {
            $result->free();
        }
        // Check if there are more results
    } while ($mysqli->more_results() && $mysqli->next_result());
    
    if ($mysqli->errno) {
        echo "❌ Error during execution: " . $mysqli->error . "\n";
    } else {
        echo "🎉 Import SUCCESS! Database populated.\n";
    }
} else {
    echo "❌ Execution Failed: " . $mysqli->error . "\n";
}

$mysqli->close();
?>
