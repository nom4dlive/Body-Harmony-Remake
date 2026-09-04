<?php
// apps/web-app/src/backend/api/v1/cron_announcements.php
// V96 — Sistema de Avisos Recorrentes (Nexus Protocol V3.1)
// Squad: chat-wizards

// 1. Carregamento de Dependências
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/Bot/Core/TelegramEngine.php';

// 2. Configurações Iniciais
$token = env('TELEGRAM_BOT_TOKEN');
$supportGroupId = (int)env('TELEGRAM_SUPPORT_GROUP_ID');
$botUser = env('TELEGRAM_BOT_USERNAME', 'SuporteBodyHarmonyBot');

if (!$token || !$supportGroupId) {
    die("❌ ERRO: TELEGRAM_BOT_TOKEN ou TELEGRAM_SUPPORT_GROUP_ID não definidos no .env\n");
}

$bot = new TelegramEngine($token);

// 3. Gerenciamento de Estado (Índice do Aviso)
$stateFile = __DIR__ . '/announcement_state.json';
$state = ['last_index' => -1];

if (file_exists($stateFile)) {
    $fileContent = file_get_contents($stateFile);
    $state = json_decode($fileContent, true) ?: $state;
}

// Rotacionar entre 5 avisos (0 a 4)
$nextIndex = ($state['last_index'] + 1) % 5;

// 4. Catálogo de Avisos (Aesthetics V3.1)
$announcements = [
    [
        'title' => '📝 PRECISA DE ACESSO?',
        'text' => "Se você é Aluna ou Licenciada e ainda não tem acesso aos portais, inicie seu cadastro agora.\n\n⚠️ *Dica:* Por segurança, o cadastro é feito apenas no chat privado.",
        'button' => '🚀 Iniciar Cadastro Seguro',
        'start' => 'reg'
    ],
    [
        'title' => '🆘 SUPORTE TÉCNICO',
        'text' => "Está com dificuldades no portal ou no conteúdo? Nossos administradores estão prontos para ajudar.\n\nAbra um ticket e receba atendimento no seu privado.",
        'button' => '🆘 Falar com Suporte',
        'start' => 'support'
    ],
    [
        'title' => '🔑 PERDEU SUA SENHA?',
        'text' => "Não consegue logar? Não se preocupe! Você pode redefinir sua senha de acesso diretamente pelo bot em poucos segundos.",
        'button' => '🔑 Recuperar Acesso',
        'start' => 'password'
    ],
    [
        'title' => '🛡️ AMBIENTE SEGURO',
        'text' => "Este grupo foi configurado para ser um canal de avisos limpo e seguro.\n\nQualquer dúvida ou envio de dados deve ser feito através do chat individual do bot.",
        'button' => '🤖 Ir para o Bot Individual',
        'start' => 'menu'
    ],
    [
        'title' => '✨ CONHEÇA OS PORTAIS',
        'text' => "Mantenha-se atualizada com os links oficiais:\n\n🎓 *Portal Aluna*: [Acessar](https://bodyharmony.com.br/portal-aluna)\n💼 *Portal Licenciada*: [Acessar](https://bodyharmony.com.br/portal-licenciada)",
        'button' => '📱 Ver Todas as Funções',
        'start' => 'menu'
    ]
];

$selected = $announcements[$nextIndex];

// 5. Construção da Mensagem e Layout
$msgBody = "🩺 *{$selected['title']}*\n\n" .
           "{$selected['text']}\n\n" .
           "━━━━━━━━━━━━━━━\n" .
           "👇 *Toque no botão abaixo para agir:*";

$keyboard = [
    'inline_keyboard' => [
        [
            ['text' => "🔥 {$selected['button']} 🔥", 'url' => "https://t.me/{$botUser}?start={$selected['start']}"]
        ]
    ]
];

// 6. Execução do Disparo
$response = $bot->sendMessage($supportGroupId, $msgBody, [
    'parse_mode' => 'Markdown',
    'reply_markup' => $keyboard
]);

// 7. Finalização e Log
if ($response['ok']) {
    $state['last_index'] = $nextIndex;
    file_put_contents($stateFile, json_encode($state));
    
    // Log de auditoria
    $logFile = dirname(__DIR__, 2) . '/logs/nexus_system.log';
    $entry = date('Y-m-d H:i:s') . " [CRON] Aviso #{$nextIndex} enviado com sucesso ao grupo {$supportGroupId}\n";
    @file_put_contents($logFile, $entry, FILE_APPEND);
    
    echo "✅ [Sucesso] Aviso #{$nextIndex} enviado.";
} else {
    $error = $response['description'] ?? 'Erro desconhecido';
    echo "❌ [Falha] Erro ao enviar aviso: {$error}";
}
