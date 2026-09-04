<?php
// tests/contracts_smoke_test.php

require_once __DIR__ . '/../apps/web-app/src/backend/vendor/autoload.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/ContractPdfService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/ContractSchemaHelper.php';

use BodyHarmony\Services\ContractPdfService;
use BodyHarmony\Services\ContractSchemaHelper;

echo "=================================================================\n";
echo "   SMOKE TEST: FULL 23-CLAUSE CONTRACTS & 9-CLAUSE OUVIINTE      \n";
echo "=================================================================\n\n";

$errors = [];

// TEST 1: Service Instantiation
echo "[TEST 1] Instantiating ContractPdfService... ";
try {
    $service = new ContractPdfService();
    echo "OK\n";
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "Service instantiation failed";
}

// TEST 2: Testing Tag Extraction & Dynamic Replacement
echo "[TEST 2] Testing Dynamic Tag Substitution with Multiple Categories... ";
try {
    $categories = [
        'Licenciamento' => [
            'html' => '<h2>CONTRATO DE LICENCIAMENTO</h2><p>Licenciada: {{LICENCIADA_NOME_RAZAO}}, Taxa: R$ {{TAXA_INICIAL_NUM}}</p>',
            'vars' => ['LICENCIADA_NOME_RAZAO' => 'YONALIA SANTOS', 'TAXA_INICIAL_NUM' => '7.000,00']
        ],
        'Ouvinte' => [
            'html' => '<h2>TERMO DE OUVINTE</h2><p>Participante: {{NOME_OUVINTE}}, Evento: {{NOME_CURSO_EVENTO}}</p>',
            'vars' => ['NOME_OUVINTE' => 'LUANA RAMOS', 'NOME_CURSO_EVENTO' => 'IMERSÃO VIP BH']
        ],
        'Clinica e Pacientes' => [
            'html' => '<h2>TCLE</h2><p>Paciente: {{NOME_PACIENTE}}, Procedimento: {{NOME_PROCEDIMENTO}}</p>',
            'vars' => ['NOME_PACIENTE' => 'MARIA SILVA', 'NOME_PROCEDIMENTO' => 'REMODELAÇÃO CORPORAL']
        ],
        'Recibos' => [
            'html' => '<h2>RECIBO</h2><p>Recebemos de {{NOME_PAGADOR}} a quantia de R$ {{VALOR_RECEBIDO_NUM}}</p>',
            'vars' => ['NOME_PAGADOR' => 'YONALIA SANTOS', 'VALOR_RECEBIDO_NUM' => '7.000,00']
        ]
    ];

    foreach ($categories as $cat => $data) {
        $rendered = $service->renderTemplate($data['html'], $data['vars']);
        foreach ($data['vars'] as $k => $v) {
            if (strpos($rendered, $v) === false) {
                throw new Exception("Falha na substituição da tag {{$k}} na categoria $cat");
            }
        }
    }
    echo "OK (4 Categorias Validadas)\n";
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = $e->getMessage();
}

// TEST 3: Compiling Contract PDF for all 6 Categories
echo "[TEST 3] Compiling Contract PDFs for all 6 categories (mPDF Engine)... \n";
$allSixCategories = [
    'Licenciamento' => '<h2>CONTRATO DE LICENCIAMENTO DE MARCA BODY HARMONY</h2><p>Objeto: Outorga de licença de uso de marca.</p>',
    'Ouvinte' => '<h2>TERMO DE OUVINTE E CONFIDENCIALIDADE</h2><p>Compromisso de sigilo em workshop e imersão.</p>',
    'Cursos e Eventos' => '<h2>CONTRATO DE MATRÍCULA E PARTICIPAÇÃO</h2><p>Matrícula oficial em curso avançado.</p>',
    'Clinica e Pacientes' => '<h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</h2><p>Autorização clínica e de uso de imagem.</p>',
    'Recibos' => '<h2>RECIBO OFICIAL DE QUITAÇÃO</h2><p>Comprovante irrevogável de pagamento.</p>',
    'Parcerias' => '<h2>TERMO DE PARCERIA E COOPERAÇÃO</h2><p>Instrumento de colaboração profissional.</p>'
];

foreach ($allSixCategories as $categoryName => $sampleHtml) {
    try {
        $uuid = 'test-' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $categoryName)) . '-' . time();
        $title = "Documento Teste - $categoryName";
        $result = $service->generatePdf($sampleHtml, $uuid, $title, [], true);
        
        if (!empty($result['sha256_hash']) && file_exists($result['file_path'])) {
            echo "   [✓] Categoria '$categoryName': OK (SHA-256: " . substr($result['sha256_hash'], 0, 12) . "...)\n";
            @unlink($result['file_path']);
        } else {
            echo "   [✗] Categoria '$categoryName': FAIL\n";
            $errors[] = "Failed PDF for $categoryName";
        }
    } catch (Exception $e) {
        echo "   [✗] Categoria '$categoryName': FAIL (" . $e->getMessage() . ")\n";
        $errors[] = $e->getMessage();
    }
}

// TEST 4: Full Digital Signature with Chancela and Forensic Audit Trail
echo "[TEST 4] Compiling Contract with Digital Signatures & Chancela Jurídica... ";
try {
    $sampleSignatures = [
        [
            'signer_type' => 'LICENCIANTE',
            'signer_name' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
            'signer_document' => '68.016.506/0001-22',
            'signer_email' => 'joselene36@gmail.com',
            'signature_mode' => 'DIGITAL_CERTIFICATE',
            'signed_at' => date('Y-m-d H:i:s'),
            'ip_address' => '127.0.0.1',
            'checksum_signature' => hash('sha256', 'BH_LICENCIANTE_' . time())
        ],
        [
            'signer_type' => 'LICENCIADA',
            'signer_name' => 'YONALIA SANTOS DE OLIVEIRA',
            'signer_document' => '038.616.992-65',
            'signer_email' => 'yonaliasantos10@gmail.com',
            'signature_mode' => 'DRAWN_CANVAS',
            'signed_at' => date('Y-m-d H:i:s'),
            'ip_address' => '177.18.29.112',
            'checksum_signature' => hash('sha256', 'LICENCIADA_SIG_' . time())
        ]
    ];

    $uuid = 'test-sig-forensic-' . time();
    $title = 'Contrato Assinado com Auditoria Forense';
    $html = '<h2>CONTRATO OFICIAL ASSINADO</h2><p>Documento auditado digitalmente.</p>';

    $signedResult = $service->generatePdf($html, $uuid, $title, $sampleSignatures, true);
    if (!empty($signedResult['sha256_hash']) && file_exists($signedResult['file_path'])) {
        echo "OK (Signed Hash: " . substr($signedResult['sha256_hash'], 0, 16) . "...)\n";
        @unlink($signedResult['file_path']);
    } else {
        echo "FAIL\n";
        $errors[] = "Signed PDF generation failed";
    }
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = $e->getMessage();
}

// TEST 5: Compiling All 6 Official Categories Full Templates with Dynamic Tags
echo "[TEST 5] Compiling Full Templates for All 6 Categories (Licenciamento, Ouvinte, Cursos, TCLE, Recibos, Parcerias)... \n";
try {
    $v103SqlPath = __DIR__ . '/../infrastructure/database/migrations/V103_Seed_All_Categories_Templates.sql';
    if (!file_exists($v103SqlPath)) {
        throw new Exception("Migration V103 não encontrada em: $v103SqlPath");
    }
    $v103Sql = file_get_contents($v103SqlPath);
    
    // Dataset for All Categories
    $testCategoryDatasets = [
        'contrato-licenciamento-padrao' => [
            'label' => 'Licenciamento 23 Cláusulas (Oficial)',
            'vars' => [
                'LICENCIADA_RAZAO_SOCIAL' => '49.930.435 YONALIA SANTOS DE OLIVEIRA',
                'LICENCIADA_CNPJ_CPF' => '49.930.435/0001-24',
                'LICENCIADA_ENDERECO' => 'Rua Rui Barbosa, 17 – Manquirao',
                'LICENCIADA_CIDADE_UF' => 'São Geraldo do Araguaia - PA',
                'LICENCIADA_CEP' => '68570-000',
                'LICENCIADA_REPRESENTANTE_NOME' => 'YONALIA SANTOS DE OLIVEIRA',
                'LICENCIADA_NACIONALIDADE' => 'brasileira',
                'LICENCIADA_ESTADO_CIVIL' => 'solteira',
                'LICENCIADA_PROFISSAO' => 'esteticista',
                'LICENCIADA_RG' => '7843134',
                'LICENCIADA_CPF' => '038.616.992-65',
                'ENDERECO_OPERACIONAL' => 'Rua Rui Barbosa, 17 - Manquirao',
                'CIDADE_OPERACIONAL' => 'São Geraldo do Araguaia',
                'ESTADO_OPERACIONAL' => 'PA',
                'VALOR_TAXA_INICIAL_NUM' => '7.000,00',
                'VALOR_TAXA_INICIAL_EXTENSO' => 'sete mil reais',
                'FORMA_PAGAMENTO_TAXA' => 'PIX à vista',
                'VALOR_TAXA_POS_CONTRATUAL_NUM' => '6.000,00',
                'VALOR_TAXA_POS_CONTRATUAL_EXTENSO' => 'seis mil reais',
                'LICENCIADA_EMAIL_OFICIAL' => 'yonaliasantos10@gmail.com',
                'CIDADE_CELEBRACAO' => 'Assis/SP',
                'DATA_CELEBRACAO_EXTENSO' => '13 de agosto de 2026',
                'TESTEMUNHA_1_NOME' => 'Mariana Costa',
                'TESTEMUNHA_1_CPF' => '111.222.333-44',
                'TESTEMUNHA_2_NOME' => 'Carlos Silva',
                'TESTEMUNHA_2_CPF' => '555.666.777-88'
            ]
        ],
        'termo-ouvinte-confidencialidade' => [
            'label' => 'Termo de Ouvinte 9 Cláusulas (Oficial)',
            'vars' => [
                'OUVINTE_NOME' => 'STEFANIA MELIANE STOPA',
                'OUVINTE_NACIONALIDADE' => 'brasileira',
                'OUVINTE_ESTADO_CIVIL' => 'solteira',
                'OUVINTE_PROFISSAO' => 'estudante',
                'OUVINTE_RG' => '21.802.015 MG',
                'OUVINTE_CPF' => '154.801.426-58',
                'OUVINTE_ENDERECO' => 'Rua Nascimento Teixeira, nº 153',
                'OUVINTE_CIDADE_UF' => 'Contagem/MG',
                'OUVINTE_CEP' => '32.235-300',
                'NOME_CURSO_EVENTO' => 'Imersão Vip Body Harmony Turma 8',
                'VALOR_TAXA_OUVINTE_NUM' => '2.000,00',
                'VALOR_TAXA_OUVINTE_EXTENSO' => 'dois mil reais',
                'FORMA_PAGAMENTO_OUVINTE' => 'PIX à vista',
                'CIDADE_CELEBRACAO' => 'Assis/SP',
                'DATA_CELEBRACAO_EXTENSO' => '05 de março de 2026',
                'TESTEMUNHA_1_NOME' => 'Testemunha Um',
                'TESTEMUNHA_1_CPF' => '123.456.789-00',
                'TESTEMUNHA_2_NOME' => 'Testemunha Dois',
                'TESTEMUNHA_2_CPF' => '987.654.321-99'
            ]
        ],
        'contrato-curso-presencial-padrao' => [
            'label' => 'Cursos e Eventos / Workshop (Oficial)',
            'vars' => [
                'ALUNA_NOME' => 'FERNANDA ALBUQUERQUE LIMA',
                'ALUNA_CPF_CNPJ' => '234.567.890-12',
                'ALUNA_RG' => '12.345.678-9',
                'ALUNA_PROFISSAO' => 'Fisioterapeuta Dermato-Funcional',
                'ALUNA_ENDERECO' => 'Av. Paulista, 1000, Bela Vista',
                'ALUNA_CIDADE_UF' => 'São Paulo/SP',
                'ALUNA_CEP' => '01310-100',
                'ALUNA_EMAIL' => 'fernanda.lima@clinica.com.br',
                'ALUNA_WHATSAPP' => '(11) 98765-4321',
                'NOME_CURSO_EVENTO' => 'Workshop Prático e Teórico de Eletroestimulação Body Harmony®',
                'MODALIDADE_CURSO' => 'Presencial / Teórico-Prático',
                'DATA_CURSO' => '25 e 26 de Outubro de 2026',
                'CARGA_HORARIA' => '16 horas',
                'LOCAL_CURSO_CIDADE_UF' => 'Assis/SP',
                'VALOR_CURSO_NUM' => '4.500,00',
                'VALOR_CURSO_EXTENSO' => 'quatro mil e quinhentos reais',
                'FORMA_PAGAMENTO_CURSO' => 'PIX à vista',
                'CRITERIO_FREQUENCIA_MINIMA' => '100% de presença',
                'PERCENTUAL_MULTA_DESISTENCIA' => '30%',
                'CIDADE_CELEBRACAO' => 'Assis/SP',
                'DATA_CELEBRACAO_EXTENSO' => '20 de outubro de 2026',
                'TESTEMUNHA_1_NOME' => 'Testemunha 1',
                'TESTEMUNHA_1_CPF' => '111.222.333-44',
                'TESTEMUNHA_2_NOME' => 'Testemunha 2',
                'TESTEMUNHA_2_CPF' => '555.666.777-88'
            ]
        ],
        'termo-consentimento-paciente-tcle' => [
            'label' => 'Clinica e Pacientes / TCLE (Oficial)',
            'vars' => [
                'PACIENTE_NOME' => 'BEATRIZ MENDONÇA SILVA',
                'PACIENTE_CPF' => '345.678.901-23',
                'PACIENTE_RG' => '34.567.890-1',
                'PACIENTE_DATA_NASCIMENTO' => '14/05/1992',
                'PACIENTE_ENDERECO' => 'Rua das Flores, 250, Assis/SP',
                'PACIENTE_TELEFONE' => '(18) 99876-5432',
                'PACIENTE_EMAIL' => 'beatriz.silva@email.com',
                'PROCEDIMENTO_SOLICITADO' => 'Eletroestimulação Muscular & Remodelação Corporal Body Harmony®',
                'AREAS_CORPOREAS_TRATAMENTO' => 'Abdômen e Glúteos',
                'NUMERO_SESSOES_PREVISTAS' => '10 sessões',
                'VALOR_TRATAMENTO_NUM' => '2.500,00',
                'VALOR_TRATAMENTO_EXTENSO' => 'dois mil e quinhentos reais',
                'FORMA_PAGAMENTO_TRATAMENTO' => 'Cartão de Crédito 3x',
                'DECLARACAO_AUSENCIA_MARCAPASSO_GESTAO' => 'Declaro expressamente que NÃO possuo marcapasso nem suspeita de gestação.',
                'MEDICACOES_USO_CONTINUO' => 'Nenhuma',
                'AUTORIZACAO_USO_IMAGEM_ANTER_DEPOIS' => 'AUTORIZO o registro fotográfico anônimo para fins científicos e estéticos',
                'PROFISSIONAL_RESPONSAVEL_NOME' => 'Dra. Juliana Mendes',
                'PROFISSIONAL_REGISTRO_CONSELHO' => 'CRBM 12345-SP',
                'CIDADE_CELEBRACAO' => 'Assis/SP',
                'DATA_CELEBRACAO_EXTENSO' => '18 de agosto de 2026'
            ]
        ],
        'recibo-oficial-quitacao-padrao' => [
            'label' => 'Recibos / Quitação Formal (Oficial)',
            'vars' => [
                'RECIBO_NUMERO' => '2026/089',
                'CIDADE_EMISSAO' => 'Assis/SP',
                'DATA_EMISSAO_EXTENSO' => '18 de agosto de 2026',
                'PAGADOR_NOME_RAZAO' => 'CLÍNICA HARMONIA INTEGRADA LTDA',
                'PAGADOR_CPF_CNPJ' => '55.666.777/0001-88',
                'PAGADOR_ENDERECO' => 'Av. Nove de Julho, 500, Centro, Assis/SP',
                'VALOR_TOTAL_NUM' => '7.000,00',
                'VALOR_TOTAL_EXTENSO' => 'sete mil reais',
                'FORMA_PAGAMENTO_DESCRICAO' => 'Transferência PIX à vista',
                'DESCRICAO_SERVICOS_TAXAS' => 'Pagamento integral referente à Taxa de Licença de Uso de Marca e Método Body Harmony®.',
                'EMISSOR_NOME_RAZAO' => 'BODY HARMONY ESTÉTICA E CURSOS LTDA',
                'EMISSOR_CPF_CNPJ' => '46.123.456/0001-89'
            ]
        ],
        'contrato-parceria-comercial-padrao' => [
            'label' => 'Parcerias / Espaço Clínico (Oficial)',
            'vars' => [
                'PARCEIRA_RAZAO_SOCIAL' => 'ESPAÇO SAÚDE & ESTÉTICA PRIME',
                'PARCEIRA_CNPJ_CPF' => '12.987.654/0001-32',
                'PARCEIRA_REPRESENTANTE' => 'Camila Rodrigues',
                'PARCEIRA_ENDERECO' => 'Rua Floriano Peixoto, 320',
                'PARCEIRA_CIDADE_UF' => 'Marília/SP',
                'PARCEIRA_EMAIL' => 'contato@espacoprime.com.br',
                'PARCEIRA_TELEFONE' => '(14) 99123-4567',
                'ENDERECO_CLINICA_PARCERIA' => 'Rua Floriano Peixoto, 320, Centro, Marília/SP',
                'ESPECIFICACAO_SALA_EQUIPAMENTOS' => 'Sala 02 climatizada com equipamento Body Harmony®',
                'DIAS_HORARIOS_DISPONIBILIZADOS' => 'Terças e Quintas, das 08h às 18h',
                'PERCENTUAL_REPASSE_PARCEIRA' => '30% sobre o faturamento bruto',
                'VALOR_MINIMO_SESSAO_NUM' => '250,00',
                'PERIODICIDADE_REPASSE' => 'Mensal até o dia 05',
                'PRAZO_VIGENCIA_MESES' => '12 meses',
                'AVISO_PREVIO_DIAS' => '30 dias',
                'MULTA_RESCISAO_NUM' => '3.000,00',
                'MULTA_RESCISAO_EXTENSO' => 'três mil reais',
                'CIDADE_CELEBRACAO' => 'Assis/SP',
                'DATA_CELEBRACAO_EXTENSO' => '18 de agosto de 2026',
                'TESTEMUNHA_1_NOME' => 'Testemunha 1',
                'TESTEMUNHA_1_CPF' => '111.222.333-44',
                'TESTEMUNHA_2_NOME' => 'Testemunha 2',
                'TESTEMUNHA_2_CPF' => '555.666.777-88'
            ]
        ]
    ];

    foreach ($testCategoryDatasets as $slug => $data) {
        $pattern = "/INSERT INTO `?contract_templates`?.*?VALUES\s*\(\s*'{$slug}'.*?'(\[.*?\])'\s*,\s*'(.*?)'\s*,\s*1/s";
        if (!preg_match($pattern, $v103Sql, $match)) {
            // Alternative regex for SQL without backticks
            $patternAlt = "/VALUES\s*\(\s*'{$slug}'.*?'(\[.*?\])'\s*,\s*'(.*?)'\s*,\s*1/s";
            preg_match($patternAlt, $v103Sql, $match);
        }

        if (empty($match[2])) {
            throw new Exception("Não foi possível extrair HTML para o template '$slug' do V103 SQL");
        }

        $rawHtml = str_replace("''", "'", $match[2]);
        $rendered = $service->renderTemplate($rawHtml, $data['vars']);
        $pdfRes = $service->generatePdf($rendered, "test-v103-{$slug}", $data['label'], [], true);

        if (!empty($pdfRes['sha256_hash']) && file_exists($pdfRes['file_path'])) {
            $filesize = filesize($pdfRes['file_path']);
            echo "   [✓] {$data['label']}: OK (Tamanho: " . round($filesize / 1024, 1) . " KB, SHA-256: " . substr($pdfRes['sha256_hash'], 0, 16) . "...)\n";
            @unlink($pdfRes['file_path']);
        } else {
            throw new Exception("Falha ao compilar PDF para template '$slug'");
        }
    }
} catch (Exception $e) {
    echo "   [✗] Erro no Teste 5: " . $e->getMessage() . "\n";
    $errors[] = "Teste 5 falhou: " . $e->getMessage();
}

// TEST 6: Logo Customization & Proportional Scale Tests
echo "[TEST 6] Testing Logo Header Customization (Center, Left, Right & Scaled Dimensions)... \n";
try {
    $logoTests = [
        'Center Logo (Standard 75px)' => ['align' => 'center', 'height' => '75px', 'margin_bottom' => '20px'],
        'Left Logo (Compact 55px)' => ['align' => 'left', 'height' => '55px', 'margin_bottom' => '15px'],
        'Right Logo (Large 95px)' => ['align' => 'right', 'height' => '95px', 'margin_bottom' => '25px'],
        'No Logo (Explicitly Disabled)' => ['show_logo' => false]
    ];

    foreach ($logoTests as $label => $options) {
        $sampleHtml = '<h1>DOCUMENTO TESTE DE LOGOTIPO</h1><p>Verificação de proporção e alinhamento visual.</p>';
        $uuid = 'test-logo-' . preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($label)) . '-' . time();
        $res = $service->generatePdf($sampleHtml, $uuid, "Teste Logo $label", [], true, $options);
        
        if (!empty($res['sha256_hash']) && file_exists($res['file_path'])) {
            $filesize = filesize($res['file_path']);
            echo "   [✓] {$label}: OK (Tamanho: " . round($filesize / 1024, 1) . " KB, Hash: " . substr($res['sha256_hash'], 0, 12) . "...)\n";
            @unlink($res['file_path']);
        } else {
            throw new Exception("Falha ao compilar PDF para $label");
        }
    }
} catch (Exception $e) {
    echo "   [✗] Erro no Teste 6: " . $e->getMessage() . "\n";
    $errors[] = "Teste 6 falhou: " . $e->getMessage();
}

// TEST 7: Structured Sections Schema Normalizer & Auto-Categorization
echo "[TEST 7] Testing Structured 6-Section Schema Normalization... \n";
try {
    // 7.1 Test with structured schema
    $sampleStructured = [
        ['id' => 'sec1', 'title' => 'Qualificação', 'fields' => [['key' => 'TEST_NOME', 'label' => 'Nome', 'type' => 'text', 'required' => true]]]
    ];
    $res1 = ContractSchemaHelper::normalizeVariablesSchema($sampleStructured, '<p>{{TEST_NOME}}</p>');
    if (count($res1) !== 1 || $res1[0]['id'] !== 'sec1') {
        throw new Exception("Falha ao preservar schema estruturado existente");
    }
    echo "   [✓] Preservação de schema estruturado: OK\n";

    // 7.2 Test with fallback HTML categorization (all 6 sections)
    $sampleHtmlAllTags = '
        {{LICENCIADA_RAZAO_SOCIAL}} {{LICENCIADA_CPF}} {{LICENCIADA_ENDERECO}}
        {{ENDERECO_OPERACIONAL}} {{CIDADE_OPERACIONAL}}
        {{VALOR_TAXA_INICIAL_NUM}} {{FORMA_PAGAMENTO_TAXA}}
        {{VALOR_TAXA_POS_CONTRATUAL_NUM}} {{MULTA_SIGILO}}
        {{LICENCIADA_EMAIL_OFICIAL}} {{LICENCIADA_TELEFONE}}
        {{CIDADE_CELEBRACAO}} {{DATA_CELEBRACAO_EXTENSO}} {{TESTEMUNHA_1_NOME}}
    ';
    $res2 = ContractSchemaHelper::normalizeVariablesSchema(null, $sampleHtmlAllTags);
    if (count($res2) < 5) {
        throw new Exception("Falha na auto-categorização das tags em seções temáticas");
    }
    echo "   [✓] Auto-categorização em seções ricas: OK (" . count($res2) . " seções detectadas)\n";

} catch (Exception $e) {
    echo "   [✗] Erro no Teste 7: " . $e->getMessage() . "\n";
    $errors[] = "Teste 7 falhou: " . $e->getMessage();
}

// TEST 8: Contract Lifecycle & Draft Variable Update (PLAN-100)
echo "[TEST 8] Testing Contract Lifecycle & Draft Variable Update... \n";
try {
    $pdfService = new ContractPdfService();
    $v103Sql = file_get_contents(__DIR__ . '/../infrastructure/database/migrations/V103_Seed_All_Categories_Templates.sql');
    $pattern = "/VALUES\s*\(\s*'contrato-licenciamento-padrao'.*?'(\[.*?\])'\s*,\s*'(.*?)'\s*,\s*1/s";
    if (!preg_match($pattern, $v103Sql, $match) || empty($match[2])) {
        throw new Exception("Não foi possível carregar o template mestre de licenciamento");
    }
    $masterTemplate = str_replace("''", "'", $match[2]);

    // 8.1 Initial draft emission without RG
    $initialVars = [
        'LICENCIADA_RAZAO_SOCIAL' => 'CLINICA ESTETICA HARMONY LTDA',
        'LICENCIADA_CNPJ_CPF' => '12.345.678/0001-90',
        'LICENCIADA_REPRESENTANTE_NOME' => 'DRA. CARLA MENDES',
        'LICENCIADA_CPF' => '111.222.333-44',
        'LICENCIADA_RG' => '', // Empty on first draft
        'CIDADE_CELEBRACAO' => 'Assis/SP',
        'DATA_CELEBRACAO_EXTENSO' => '24 de agosto de 2026'
    ];

    $initialHtml = $pdfService->renderTemplate($masterTemplate, $initialVars);
    if (strpos($initialHtml, 'CLINICA ESTETICA HARMONY LTDA') === false) {
        throw new Exception("Razão social inicial não foi renderizada");
    }
    echo "   [✓] Criação do Rascunho Inicial (sem RG): OK\n";

    // 8.2 Update draft adding RG and new profession
    $updatedVars = array_merge($initialVars, [
        'LICENCIADA_RG' => 'MG-19.876.543',
        'LICENCIADA_PROFISSAO' => 'Biomédica Esteta'
    ]);

    // Re-render must use master template, not the already-rendered initialHtml
    $updatedHtml = $pdfService->renderTemplate($masterTemplate, $updatedVars);

    if (strpos($updatedHtml, 'MG-19.876.543') === false) {
        throw new Exception("Novo RG não foi interpolado no HTML atualizado");
    }
    if (strpos($updatedHtml, 'Biomédica Esteta') === false) {
        throw new Exception("Nova Profissão não foi interpolada no HTML atualizado");
    }

    // 8.3 Compile PDF and check validity
    $testUuid = 'test-lifecycle-plan-100';
    $pdfResult = $pdfService->generatePdf($updatedHtml, $testUuid, "Contrato Atualizado Teste", [], true);
    if (empty($pdfResult['sha256_hash']) || !file_exists($pdfResult['file_path'])) {
        throw new Exception("Falha ao compilar PDF do contrato atualizado");
    }
    echo "   [✓] Recompilação com Novo RG ('MG-19.876.543') e Profissão: OK (PDF SHA-256: " . substr($pdfResult['sha256_hash'], 0, 16) . "...)\n";
    @unlink($pdfResult['file_path']);

} catch (Exception $e) {
    echo "   [✗] Erro no Teste 8: " . $e->getMessage() . "\n";
    $errors[] = "Teste 8 falhou: " . $e->getMessage();
}

echo "\n-----------------------------------------------------------------\n";
if (empty($errors)) {
    echo "VEREDICTO: [PASS] - Todos os testes de contratos, modelos completos, schemas em 6 seções, LOGO e ciclo de vida PLAN-100 passaram com 100% de sucesso!\n";
    exit(0);
} else {
    echo "VEREDICTO: [FAIL] - Erros encontrados:\n";
    foreach ($errors as $err) {
        echo " - $err\n";
    }
    exit(1);
}
