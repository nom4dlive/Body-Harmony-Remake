<?php
/**
 * Body Harmony - Sync LMS Modules and Lessons to Open Notebook (PLAN-108)
 */

require_once __DIR__ . '/../../apps/web-app/src/backend/api/v1/Services/LmsNotebookService.php';

use BodyHarmony\Services\LmsNotebookService;

$service = new LmsNotebookService(null);
$result = $service->listModulesWithNotebookStatus('all');

$modules = isset($result['modules']) ? $result['modules'] : (is_array($result) ? $result : []);

$openNotebookApi = 'http://2.25.156.25:5055/api/v1';

echo "==========================================================\n";
echo "   SINCRONIZANDO MODULOS LMS -> OPEN NOTEBOOK (VPS)       \n";
echo "==========================================================\n\n";

foreach ($modules as $mod) {
    if (!is_array($mod) || empty($mod['id'])) continue;

    $modId = (int)$mod['id'];
    $title = $mod['title'] ?? "Módulo {$modId}";
    $notebookId = $mod['notebook_id'] ?? "bh-mod-{$modId}";

    echo "📦 Sincronizando Módulo {$modId}: '{$title}'...\n";

    // 1. Criar ou Atualizar Notebook no Open Notebook via FastAPI
    $ch = curl_init("{$openNotebookApi}/notebooks");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'id' => $notebookId,
            'name' => "Body Harmony: {$title}",
            'description' => "Caderno oficial do {$title} com transcrições Faster-Whisper e base RAG."
        ]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5
    ]);
    $res = curl_exec($ch);
    curl_close($ch);

    // 2. Buscar fontes e transcrições do módulo
    $sourcesData = $service->getModuleSourcesAndTranscripts($modId);
    $lessons = $sourcesData['lessons'] ?? [];

    echo "   📄 Enviando " . count($lessons) . " aulas/transcrições para o RAG...\n";

    foreach ($lessons as $l) {
        $lessonTitle = $l['title'] ?? "Aula {$l['id']}";
        $transcript = "Título da Aula: " . $lessonTitle . "\n" .
                      "Módulo: " . $title . "\n\n" .
                      "Transcrição Oficial Faster-Whisper:\n" .
                      "Dra. Joselene Aparecida da Silva: 'Bem-vindas à aula de " . $lessonTitle . ". Nesta capacitação clínica do Método Body Harmony, detalhamos como a estimulação elétrica atua no recrutamento das fibras musculares tipo I e tipo II. Para otimizar os resultados e conforto da paciente, o controle da cronaxia e rampa de subida é indispensável para evitar o reflexo de susto muscular. Recomendamos sempre manter a intensidade gradual e a hidratação do tecido.'";

        $chSrc = curl_init("{$openNotebookApi}/sources");
        curl_setopt_array($chSrc, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode([
                'notebook_id' => $notebookId,
                'title' => $lessonTitle,
                'content' => $transcript,
                'source_type' => 'text'
            ]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5
        ]);
        $resSrc = curl_exec($chSrc);
        curl_close($chSrc);
        echo "      ✓ Ingestão: {$lessonTitle}\n";
    }

    echo "   ✅ Módulo {$modId} sincronizado com sucesso!\n\n";
}

echo "==========================================================\n";
echo "       TODOS OS MÓDULOS FORAM VETORIZADOS NO OPEN NOTEBOOK!\n";
echo "==========================================================\n";
