<?php
// apps/web-app/src/backend/api/sync_photos_v38.php
// Script de Sincronização Inteligente

require_once 'config.php';
global $pdo;

header('Content-Type: text/html; charset=utf-8');
echo "<h1>📸 Sincronização de Fotos V38</h1>";

// 1. Listar arquivos na pasta
$dir = PUBLIC_UPLOADS_DIR . '/licenciadas';
if (!is_dir($dir)) {
    die("❌ Diretório não encontrado: $dir");
}

$files = scandir($dir);
$fileMap = []; // [nome_limpo => nome_real]
foreach ($files as $f) {
    if ($f === '.' || $f === '..') continue;
    $clean = str_replace(['.png', '.jpg', '.jpeg', '@'], ['', '', '', ''], strtolower($f));
    $fileMap[$clean] = $f;
}

echo "<p>📂 Arquivos encontrados: " . count($fileMap) . "</p>";

// 2. Buscar licenciadas
$sql = "SELECT id, username, instagram, photo_url FROM students WHERE active = 1";
$stmt = $pdo->query($sql);
$students = $stmt->fetchAll();

$updates = 0;

echo "<ul>";
foreach ($students as $s) {
    // Tentar match por Instagram (preferido)
    $instaClean = str_replace('@', '', strtolower($s['instagram'] ?? ''));
    $userClean = strtolower($s['username'] ?? '');
    
    $match = null;
    
    if ($instaClean && isset($fileMap[$instaClean])) {
        $match = $fileMap[$instaClean];
        echo "<li>✅ Match por Instagram: " . $s['instagram'] . " -> $match</li>";
    } elseif ($userClean && isset($fileMap[$userClean])) {
        $match = $fileMap[$userClean];
        echo "<li>✅ Match por Username: " . $s['username'] . " -> $match</li>";
    }

    if ($match) {
        $newUrl = "/uploads/licenciadas/$match";
        if ($s['photo_url'] !== $newUrl) {
            $pdo->prepare("UPDATE students SET photo_url = ? WHERE id = ?")
                ->execute([$newUrl, $s['id']]);
            $updates++;
        }
    } else {
        echo "<li style='color:red;'>❌ Sem foto correspondente: " . ($s['instagram'] ?: $s['username']) . "</li>";
    }
}
echo "</ul>";

echo "<h2>🚀 Atualizados $updates registros.</h2>";
?>
