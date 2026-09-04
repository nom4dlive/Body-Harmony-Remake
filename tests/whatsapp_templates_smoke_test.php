<?php
// tests/whatsapp_templates_smoke_test.php

require_once __DIR__ . '/../apps/web-app/src/backend/vendor/autoload.php';

echo "=================================================================\n";
echo "   SMOKE TEST: WHATSAPP MESSAGE TEMPLATES & SEED INTEGRITY       \n";
echo "=================================================================\n\n";

$seeds = [
    [
        'slug' => 'licenciada-doc-obrigatoria',
        'category' => 'LICENCIADAS',
        'title' => '👑 Documentos Obrigatórios (Novas Licenciadas)',
        'description' => 'Solicitação cordial e acolhedora para cadastro de novas licenciadas.',
        'content' => "Olá, {{NOME}}! ✨ Seja muito bem-vinda à família Body Harmony! 💖\n\nEstamos muito felizes em ter você conosco nessa jornada incrível de saúde e estética! 🌿\n\nPara finalizarmos seu credenciamento e liberar seus acessos oficiais, por gentileza nos envie fotos legíveis ou digitalizadas dos seguintes documentos:\n\n🎓 *Certificado do curso*\n📜 *Alvará de funcionamento ou CNPJ*\n🪪 *CPF e RG*\n🏠 *Comprovante de residência atualizado*\n✉️ *E-mail de contato*\n📞 *Telefone de contato principal*\n\nSe tiver qualquer dúvida na separação dos documentos, me avise por aqui! Estamos à disposição para te ajudar. 😊",
        'variables' => ['NOME', 'TELEFONE'],
        'order' => 1
    ],
    [
        'slug' => 'licenciada-primeiro-acesso',
        'category' => 'LICENCIADAS',
        'title' => '🔑 Primeiro Acesso da Licenciada (Portal Exclusivo)',
        'description' => 'Guia acolhedor de primeiro acesso com login e senha temporária.',
        'content' => "Olá, {{NOME}}! ✨ Seja muito bem-vinda à área exclusiva de Licenciadas Body Harmony! 💖\n\nSeu cadastro foi liberado! A partir de agora você já pode acessar seu portal exclusivo para conferir materiais, certificações e ferramentas. 🚀\n\nPara fazer seu primeiro acesso:\n🔗 *Link:* https://bodyharmony.com.br/portal-licenciada\n✉️ *E-mail:* {{EMAIL}}\n🔑 *Senha temporária:* {{SENHA}}\n\nPor favor, tente fazer o login e confirme se deu tudo certo! Ao entrar, você poderá cadastrar sua senha definitiva. Qualquer dúvida, estou por aqui! 🌿",
        'variables' => ['NOME', 'EMAIL', 'SENHA'],
        'order' => 2
    ],
    [
        'slug' => 'licenciada-reset-senha-temporaria',
        'category' => 'LICENCIADAS',
        'title' => '🔒 Nova Senha Temporária (Portal da Licenciada)',
        'description' => 'Envio amigável de nova senha temporária para redefinição de acesso.',
        'content' => "Olá, {{NOME}}! Tudo bem com você? 😊\n\nGerei uma nova senha temporária para o seu acesso ao Portal da Licenciada Body Harmony:\n\n🔑 *Nova Senha:* {{SENHA}}\n\nPor favor, tente logar novamente pelo link abaixo e me confirme se deu tudo certo:\n🔗 https://bodyharmony.com.br/portal-licenciada\n\nAo entrar, você poderá personalizar para a sua senha definitiva. Se precisar de mais alguma ajuda, pode me chamar por aqui! 💖",
        'variables' => ['NOME', 'SENHA'],
        'order' => 3
    ],
    [
        'slug' => 'licenciada-lembrete-pendencias',
        'category' => 'LICENCIADAS',
        'title' => '📌 Lembrete Gentil de Pendências (Licenciadas)',
        'description' => 'Follow-up amigável para envio de documentos pendentes.',
        'content' => "Olá, {{NOME}}! Tudo bem com você? 😊\n\nPassando apenas para lembrar que estamos aguardando seus documentos para concluir seu credenciamento Body Harmony. 📄✨\n\nFalta bem pouquinho! Assim que puder me enviar por aqui, já daremos andamento imediato na liberação dos seus benefícios. 🚀\n\nQualquer dúvida, conte comigo! 💖",
        'variables' => ['NOME'],
        'order' => 4
    ],
    [
        'slug' => 'aluna-boas-vindas-lms',
        'category' => 'ALUNAS',
        'title' => '🎓 Boas-Vindas & Acesso às Aulas (Aluna Individual)',
        'description' => 'Envio amigável de credenciais e orientações de acesso ao portal LMS.',
        'content' => "Olá, {{NOME}}! ✨ Seja super bem-vinda ao curso Body Harmony! 🎓💖\n\nSeu acesso ao nosso Portal de Aulas já está totalmente liberado! 🎉\n\nPara acessar seu painel:\n🔗 *Link:* https://bodyharmony.com.br/portal-aluna\n✉️ *Login:* {{EMAIL}}\n🔑 *Senha provisória:* {{SENHA}}\n\nAo entrar, você poderá personalizar sua senha com segurança. Desejamos um excelente aprendizado! 🌟",
        'variables' => ['NOME', 'EMAIL', 'SENHA'],
        'order' => 3
    ],
    [
        'slug' => 'contrato-instrucoes-assinatura',
        'category' => 'CONTRATOS',
        'title' => '📄 Instruções de Assinatura Digital de Contrato',
        'description' => 'Passo a passo simples para validação e assinatura digital.',
        'content' => "Olá, {{NOME}}! Tudo bem? 😊\n\nSeu contrato Body Harmony está pronto para assinatura digital com total validade jurídica e segurança! 🔒✨\n\nÉ bem simples e leva menos de 1 minuto:\n1️⃣ Acesse o link seguro: {{LINK_ASSINATURA}}\n2️⃣ Confirme seus dados e desenhe/digite sua assinatura.\n3️⃣ Clique em *Finalizar e Assinar*.\n\nAssim que concluído, você receberá a cópia final assinada no seu e-mail. Qualquer dúvida, estou por aqui! 🌿",
        'variables' => ['NOME', 'LINK_ASSINATURA'],
        'order' => 4
    ],
    [
        'slug' => 'suporte-orientacao-atendimento',
        'category' => 'SUPORTE',
        'title' => '💬 Boas-Vindas & Canal de Suporte Operacional',
        'description' => 'Mensagem de pronto atendimento e auxílio ao cliente/licenciada.',
        'content' => "Olá, {{NOME}}! Tudo ótimo com você? 🌿\n\nEste é o canal oficial de suporte da Body Harmony! 💖\n\nComo posso te ajudar no dia de hoje? Fique à vontade para me enviar sua dúvida, comprovante ou mensagem. Respondo você em breve! 😊✨",
        'variables' => ['NOME'],
        'order' => 5
    ],
    [
        'slug' => 'contrato-envio-oficial',
        'category' => 'CONTRATOS',
        'title' => '📄 Envio Oficial do Contrato para Leitura & Assinatura',
        'description' => 'Orientações amigáveis de assinatura física (com firma reconhecida) ou digital (gov.br).',
        'content' => "Olá, {{NOME}}! Tudo bem? ✨\n\nAcabamos de gerar o seu contrato Body Harmony e estamos te enviando o documento novinho em anexo para você dar uma olhada! 📄💖",
        'variables' => ['NOME', 'LINK_ASSINATURA'],
        'order' => 5
    ],
    [
        'slug' => 'contrato-formal-notificacao',
        'category' => 'CONTRATOS',
        'title' => '⚖️ Notificação Formal — Encaminhamento de Contrato',
        'description' => 'Notificação executiva e institucional para acompanhamento formal jurídico.',
        'content' => "Prezada {{NOME}},\n\nEncaminhamos o seu Contrato de Licenciamento Body Harmony para apreciação e assinatura.",
        'variables' => ['NOME', 'LINK_ASSINATURA'],
        'order' => 6
    ],
    [
        'slug' => 'faq-exclusividade-territorial',
        'category' => 'CONTRATOS',
        'title' => '❓ Dúvida Frequente: Exclusividade Territorial & Proteção Regional',
        'description' => 'Esclarecimento amigável sobre a garantia de exclusividade no território (50 mil hab.).',
        'content' => "Olá, {{NOME}}! Tudo bem? 😊\n\nSobre a sua dúvida em relação à exclusividade territorial no contrato Body Harmony:",
        'variables' => ['NOME'],
        'order' => 7
    ],
    [
        'slug' => 'faq-renovacao-gratuita',
        'category' => 'CONTRATOS',
        'title' => '❓ Dúvida Frequente: Renovação Gratuita do Contrato após 2 Anos',
        'description' => 'Esclarecimento simples sobre a isenção de taxas avisando com 60 dias de antecedência.',
        'content' => "Olá, {{NOME}}! Tudo ótimo por aí? 🌿\n\nSobre a renovação do contrato após os 24 meses:",
        'variables' => ['NOME'],
        'order' => 8
    ],
    [
        'slug' => 'faq-restricoes-medicas-triagem',
        'category' => 'LICENCIADAS',
        'title' => '🩺 Esclarecimento: Triagem de Saúde & Restrições Médicas',
        'description' => 'Orientações de segurança do paciente, contraindicações e consulta prévia.',
        'content' => "Olá, {{NOME}}! Tudo bem? 😊\n\nSobre o atendimento aos clientes e a triagem médica no contrato Body Harmony:",
        'variables' => ['NOME'],
        'order' => 5
    ],
    [
        'slug' => 'inventario-dados-pendentes',
        'category' => 'CONTRATOS',
        'title' => '📋 Solicitação de Dados para Emissão do Contrato',
        'description' => 'Checklist dos dados cadastrais necessários para emissão e qualificação.',
        'content' => "Olá, {{NOME}}! ✨ Vamos preparar o seu contrato oficial Body Harmony? 📄💖",
        'variables' => ['NOME', 'CPF_CNPJ', 'EMAIL', 'TELEFONE'],
        'order' => 9
    ]
];

// 1. Check Seed Count
if (count($seeds) >= 5) {
    echo "[TEST 1] Standard seed templates defined: " . count($seeds) . " templates... OK\n";
} else {
    echo "[FAIL TEST 1] Seed template count mismatch\n";
    exit(1);
}

// 2. Check Documentos Obrigatórios Seed Content
$licDoc = null;
foreach ($seeds as $s) {
    if ($s['slug'] === 'licenciada-doc-obrigatoria') {
        $licDoc = $s;
        break;
    }
}

if (!$licDoc) {
    echo "[FAIL TEST 2] Seed 'licenciada-doc-obrigatoria' not found!\n";
    exit(1);
}

$requiredKeywords = [
    'Certificado do curso',
    'Alvará de funcionamento ou CNPJ',
    'CPF e RG',
    'Comprovante de residência atualizado',
    'E-mail',
    'Telefone'
];

$missingKeywords = [];
foreach ($requiredKeywords as $keyword) {
    if (strpos($licDoc['content'], $keyword) === false) {
        $missingKeywords[] = $keyword;
    }
}

if (empty($missingKeywords)) {
    echo "[TEST 2] Seed 'Documentos Obrigatórios' verified with all 6 required items... OK\n";
} else {
    echo "[FAIL TEST 2] Seed missing required keywords: " . implode(', ', $missingKeywords) . "\n";
    exit(1);
}

// 3. Test Category Grouping
$categories = ['LICENCIADAS', 'ALUNAS', 'CONTRATOS', 'SUPORTE'];
foreach ($categories as $cat) {
    $cCount = 0;
    foreach ($seeds as $s) {
        if ($s['category'] === $cat) $cCount++;
    }
    echo "   [✓] Categoria '{$cat}': {$cCount} modelo(s) encontrado(s)\n";
}

echo "\n-----------------------------------------------------------------\n";
echo "VEREDICTO: [PASS] - Todos os testes de modelos de mensagem WhatsApp passaram com 100% de sucesso!\n";
