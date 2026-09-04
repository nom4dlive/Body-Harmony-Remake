<?php
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $conn = $pdo ?? $db;

    // 1. Tickets de suporte
    $tickets = [];
    try {
        $stmt = $conn->query("SELECT * FROM bot_support_tickets ORDER BY id DESC LIMIT 20");
        $tickets = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    } catch (\Throwable $e) {}

    // 2. Mentorias e dúvidas clínicas de IA
    $mentorLogs = [];
    try {
        $stmt = $conn->query("SELECT * FROM ai_mentorship_logs ORDER BY id DESC LIMIT 20");
        $mentorLogs = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    } catch (\Throwable $e) {}

    // 3. Taxas de licenciadas / financeiro
    $taxas = [];
    try {
        $stmt = $conn->query("SELECT * FROM licenciada_taxas ORDER BY id DESC LIMIT 20");
        $taxas = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    } catch (\Throwable $e) {}

    // 4. Onboarding de licenciadas
    $onboardings = [];
    try {
        $stmt = $conn->query("SELECT * FROM licenciada_onboarding_requests ORDER BY id DESC LIMIT 20");
        $onboardings = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    } catch (\Throwable $e) {}

    // 5. Query Evolution API for inst_licenciadas messages
    $evoUrl = 'https://evolution.bodyharmony.com.br/chat/findMessages/inst_licenciadas';
    $evoKey = getenv('EVOLUTION_API_KEY') ?: '';
    $evoMessages = [];

    $ch = curl_init($evoUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['page' => 1, 'limit' => 30]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'apikey: ' . $evoKey
        ],
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    $evoRes = curl_exec($ch);
    curl_close($ch);
    if ($evoRes) {
        $evoMessages = json_decode($evoRes, true) ?: ['raw' => substr($evoRes, 0, 500)];
    }

    // 6. Query chats list for inst_licenciadas
    $evoChatsUrl = 'https://evolution.bodyharmony.com.br/chat/findChats/inst_licenciadas';
    $ch2 = curl_init($evoChatsUrl);
    curl_setopt_array($ch2, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'apikey: ' . $evoKey
        ],
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    $evoChatsRes = curl_exec($ch2);
    curl_close($ch2);
    $evoChats = json_decode($evoChatsRes, true) ?: [];

    echo json_encode([
        'tickets' => $tickets,
        'mentor_logs' => $mentorLogs,
        'taxas' => $taxas,
        'onboardings' => $onboardings,
        'evo_messages' => $evoMessages,
        'evo_chats' => $evoChats
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (\Throwable $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
