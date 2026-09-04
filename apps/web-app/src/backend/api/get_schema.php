<?php
require 'config.php';
global $pdo;
$stmt = $pdo->query('SHOW CREATE TABLE licenciada_devices');
echo $stmt->fetchColumn(1);
?>
