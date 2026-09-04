<?php
require_once __DIR__ . '/public_html/api/config.php';
$stmt = $pdo->query('SHOW TABLES');
while($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo $row[0] . PHP_EOL;
}
