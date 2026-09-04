<?php
// Script final para garantir dados consistentes
require_once __DIR__ . '/config.php';
try {
    $stmt = $pdo->prepare("UPDATE lms_modules SET cover_image = ? WHERE title LIKE '%Introdução ao Body Harmony%'");
    $stmt->execute(['Introducao_ao_Body_Harmony_00_Aula_1_-_Boas_vindas.png']);

    $stmt2 = $pdo->prepare("UPDATE lms_modules SET cover_image = ? WHERE title LIKE '%Introdução a Prática e Protocolos%'");
    $stmt2->execute(['Negocios_marketing__00_Aula_1_-_CAIXA_RAPIDO.png']);

    echo "✅ PRODUCTION: Final DB sync complete";
} catch (Exception $e) { echo "❌ ERROR: " . $e->getMessage(); }
?>
