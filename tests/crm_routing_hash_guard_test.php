<?php
// tests/crm_routing_hash_guard_test.php
// Body Harmony Nexus V3.2 — CRM Routing & Hash Guard Deterministic Test (PLAN-206)

echo "====================================================================\n";
echo "   TESTE DETERMINÍSTICO: CRM ROUTING & HASH GUARD (PLAN-206)       \n";
echo "====================================================================\n\n";

// Implementação espelho em PHP das funções puras do crmRoutingGuard.js para validação determinística
$HASH_SECTION_MAP = [
    'settings-hermes' => 'HERMES',
    'settings-channels' => 'CHANNELS',
    'settings-team' => 'TEAM',
    'settings-google' => 'GOOGLE',
    'settings-analytics' => 'ANALYTICS',
    'settings-colors' => 'COLORS',
    'settings_hermes' => 'HERMES',
    'settings_channels' => 'CHANNELS',
    'settings_team' => 'TEAM',
    'settings_google' => 'GOOGLE',
    'settings_analytics' => 'ANALYTICS',
    'settings_colors' => 'COLORS',
    'hermes' => 'HERMES',
    'channels' => 'CHANNELS',
    'team' => 'TEAM',
    'google' => 'GOOGLE',
    'analytics' => 'ANALYTICS',
    'colors' => 'COLORS'
];

function sanitizeHash(?string $rawHash): string {
    if (!$rawHash) return '';
    return strtolower(trim(ltrim($rawHash, '#/')));
}

function resolveCrmTab(?string $rawHash, array $map): string {
    $clean = sanitizeHash($rawHash);
    if ($clean === '') return 'INBOX';
    if ($clean === 'kanban') return 'KANBAN';
    if ($clean === 'settings' || str_starts_with($clean, 'settings-') || str_starts_with($clean, 'settings_') || isset($map[$clean])) {
        return 'SETTINGS';
    }
    if ($clean === 'inbox') return 'INBOX';
    return 'INBOX';
}

function resolveSettingsSection(?string $rawHash, array $map): string {
    $clean = sanitizeHash($rawHash);
    if ($clean === '') return 'HERMES';
    if (isset($map[$clean])) return $map[$clean];
    if (str_starts_with($clean, 'settings-') || str_starts_with($clean, 'settings_')) {
        $sub = preg_replace('/^settings[-_]/', '', $clean);
        if (isset($map[$sub])) return $map[$sub];
    }
    return 'HERMES';
}

// Matriz de Testes de Permutações
$testCases = [
    // Sub-seções com prefixo settings-
    ['hash' => '#settings-google', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'GOOGLE'],
    ['hash' => '#settings-hermes', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'HERMES'],
    ['hash' => '#settings-channels', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'CHANNELS'],
    ['hash' => '#settings-team', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'TEAM'],
    ['hash' => '#settings-analytics', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'ANALYTICS'],
    ['hash' => '#settings-colors', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'COLORS'],
    
    // Sem hash prefix (#)
    ['hash' => 'settings-google', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'GOOGLE'],
    ['hash' => 'settings-hermes', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'HERMES'],
    
    // Nomes diretos de seções
    ['hash' => '#google', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'GOOGLE'],
    ['hash' => '#hermes', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'HERMES'],
    ['hash' => '#channels', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'CHANNELS'],
    ['hash' => '#team', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'TEAM'],
    ['hash' => '#analytics', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'ANALYTICS'],
    ['hash' => '#colors', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'COLORS'],
    
    // Abas principais
    ['hash' => '#settings', 'expectedTab' => 'SETTINGS', 'expectedSection' => 'HERMES'],
    ['hash' => '#kanban', 'expectedTab' => 'KANBAN', 'expectedSection' => 'HERMES'],
    ['hash' => '#inbox', 'expectedTab' => 'INBOX', 'expectedSection' => 'HERMES'],
    
    // Casos de borda / desconhecidos
    ['hash' => '', 'expectedTab' => 'INBOX', 'expectedSection' => 'HERMES'],
    ['hash' => '#', 'expectedTab' => 'INBOX', 'expectedSection' => 'HERMES'],
    ['hash' => '#rota-invalida', 'expectedTab' => 'INBOX', 'expectedSection' => 'HERMES']
];

echo ">> Testando matriz completa de 20 casos de hash...\n";
$passed = 0;
foreach ($testCases as $idx => $tc) {
    $tab = resolveCrmTab($tc['hash'], $HASH_SECTION_MAP);
    $sec = resolveSettingsSection($tc['hash'], $HASH_SECTION_MAP);

    if ($tab === $tc['expectedTab'] && $sec === $tc['expectedSection']) {
        echo "   [✓] Caso #" . ($idx + 1) . " ('{$tc['hash']}') -> Tab: {$tab} | Section: {$sec}\n";
        $passed++;
    } else {
        echo "   [✗] Falha no Caso #" . ($idx + 1) . " ('{$tc['hash']}'): Esperado [Tab: {$tc['expectedTab']}, Sec: {$tc['expectedSection']}], Recebido [Tab: {$tab}, Sec: {$sec}]\n";
        exit(1);
    }
}

echo "\n====================================================================\n";
echo "🎉 TODOS OS 20 CASOS DA MATRIZ DE ROTEAMENTO FORAM APROVADOS ({$passed}/{$passed})!\n";
echo "====================================================================\n";
