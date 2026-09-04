-- =========================================================================
-- MIGRATION: V101_Create_Contracts_And_Signatures.sql
-- AUTHOR: Antigravity Agent (Nexus Protocol V3.1)
-- DATE: 2026-08-18
-- SCOPE: Gestão de Contratos, 6 Categorias Oficiais, Assinaturas Digitais e Trilha Forense (PLAN-036 / PLAN-037)
-- =========================================================================

-- 1. Tabela de Modelos de Contratos (Templates)
CREATE TABLE IF NOT EXISTS `contract_templates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento',
  `description` TEXT NULL,
  `version` VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  `variables_schema` JSON NULL COMMENT 'Esquema de campos editaveis por aba',
  `content_html` LONGTEXT NOT NULL COMMENT 'Estrutura HTML base com tags {{VARIAVEL}}',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_template_category` (`category`),
  INDEX `idx_template_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela Principal de Contratos Emitidos
CREATE TABLE IF NOT EXISTS `contracts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(64) NOT NULL UNIQUE,
  `template_id` INT UNSIGNED NULL,
  `licenciada_id` INT UNSIGNED NULL,
  `title` VARCHAR(255) NOT NULL,
  `status` ENUM('DRAFT', 'GENERATED', 'PENDING_SIGNATURE', 'SIGNED', 'CANCELLED', 'ARCHIVED') NOT NULL DEFAULT 'GENERATED',
  `variables_payload` JSON NULL COMMENT 'Valores reais preenchidos para as tags',
  `rendered_html` LONGTEXT NULL COMMENT 'HTML compilado apos substituicao das tags',
  `pdf_path` VARCHAR(255) NULL COMMENT 'Caminho do arquivo PDF no storage privado',
  `sha256_hash` VARCHAR(64) NULL COMMENT 'Hash criptografico do documento',
  `sign_token` VARCHAR(100) NULL UNIQUE COMMENT 'Token para link publico de assinatura',
  `sign_token_expires_at` DATETIME NULL,
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_contract_status` (`status`),
  INDEX `idx_contract_licenciada` (`licenciada_id`),
  INDEX `idx_contract_token` (`sign_token`),
  INDEX `idx_contract_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Assinaturas e Auditoria Forense (Lei 14.063/2020)
CREATE TABLE IF NOT EXISTS `contract_signatures` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `contract_id` INT UNSIGNED NOT NULL,
  `signer_type` ENUM('LICENCIANTE', 'LICENCIADA', 'TESTEMUNHA_1', 'TESTEMUNHA_2', 'PACIENTE', 'PARCEIRO') NOT NULL DEFAULT 'LICENCIADA',
  `signer_name` VARCHAR(255) NOT NULL,
  `signer_document` VARCHAR(40) NOT NULL COMMENT 'CPF ou CNPJ',
  `signer_email` VARCHAR(150) NULL,
  `signature_mode` ENUM('DRAWN_CANVAS', 'TYPED_SIGNATURE', 'UPLOAD_IMAGE', 'GOV_BR_UPLOAD', 'DIGITAL_CERTIFICATE') NOT NULL DEFAULT 'DRAWN_CANVAS',
  `signature_image_path` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NOT NULL,
  `signed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `audit_trail_json` JSON NULL COMMENT 'Metadados adicionais de geolocalizacao e headers',
  `checksum_signature` VARCHAR(64) NOT NULL COMMENT 'Hash da assinatura com carimbo de tempo',
  FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  INDEX `idx_signature_contract` (`contract_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEEDS: 6 Categorias Oficiais de Modelos de Documentos Body Harmony
-- =========================================================================

-- 1. Licenciamento
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`)
VALUES (
  'licenciamento-padrao',
  'Contrato de Licenciamento de Marca Body Harmony®',
  'Licenciamento',
  'Modelo padrão oficial para outorga de uso de marca, know-how estético e territorialidade da rede Body Harmony.',
  'v3.1',
  '[
    {
      "id": "qualificacao",
      "title": "1. Qualificação da Licenciada",
      "fields": [
        {"key": "LICENCIADA_NOME_RAZAO", "label": "Nome Completo ou Razão Social", "type": "text", "required": true, "default_value": ""},
        {"key": "LICENCIADA_CNPJ_CPF", "label": "CNPJ ou CPF da Licenciada", "type": "text", "required": true, "default_value": ""},
        {"key": "LICENCIADA_ENDERECO_COMPLETO", "label": "Endereço Completo com CEP", "type": "text", "required": true, "default_value": ""},
        {"key": "LICENCIADA_REPRESENTANTE", "label": "Representante Legal (se PJ)", "type": "text", "required": false, "default_value": ""},
        {"key": "LICENCIADA_NACIONALIDADE", "label": "Nacionalidade", "type": "text", "required": true, "default_value": "brasileira"},
        {"key": "LICENCIADA_ESTADO_CIVIL", "label": "Estado Civil", "type": "text", "required": true, "default_value": "solteira"},
        {"key": "LICENCIADA_PROFISSAO", "label": "Profissão", "type": "text", "required": true, "default_value": "Esteticista"},
        {"key": "LICENCIADA_RG", "label": "RG", "type": "text", "required": true, "default_value": ""},
        {"key": "LICENCIADA_CPF", "label": "CPF do Representante", "type": "text", "required": true, "default_value": ""}
      ]
    },
    {
      "id": "territorialidade",
      "title": "2. Territorialidade & Operação",
      "fields": [
        {"key": "DELIMITACAO_TERRITORIAL", "label": "Delimitação Municipal e Habitantes (Cláusula 4.1)", "type": "text", "required": true, "default_value": "município de Assis/SP"},
        {"key": "ENDERECO_OPERACIONAL", "label": "Endereço de Atuação da Clínica (Cláusula 4.2)", "type": "text", "required": true, "default_value": ""}
      ]
    },
    {
      "id": "financeiro",
      "title": "3. Condições Financeiras",
      "fields": [
        {"key": "TAXA_INICIAL_NUM", "label": "Taxa Inicial R$ (Cláusula 5.1)", "type": "text", "required": true, "default_value": "7.000,00"},
        {"key": "TAXA_INICIAL_EXTENSO", "label": "Taxa Inicial por Extenso", "type": "text", "required": true, "default_value": "sete mil reais"},
        {"key": "CONDICOES_PAGAMENTO", "label": "Modalidade de Pagamento", "type": "text", "required": true, "default_value": "à vista via PIX"},
        {"key": "VALOR_MINIMO_SESSAO", "label": "Preço Mínimo por Sessão R$ (Cláusula 5.3)", "type": "text", "required": true, "default_value": "150,00"}
      ]
    },
    {
      "id": "comunicacao",
      "title": "4. Comunicações & Compliance",
      "fields": [
        {"key": "LICENCIADA_EMAIL", "label": "E-mail Oficial da Licenciada", "type": "email", "required": true, "default_value": ""},
        {"key": "LICENCIADA_TELEFONE", "label": "Telefone / WhatsApp Oficial", "type": "text", "required": true, "default_value": ""}
      ]
    },
    {
      "id": "fechamento",
      "title": "5. Fechamento & Testemunhas",
      "fields": [
        {"key": "CIDADE_CELEBRACAO", "label": "Cidade de Celebração", "type": "text", "required": true, "default_value": "Assis/SP"},
        {"key": "DATA_CELEBRACAO_EXTENSO", "label": "Data por Extenso", "type": "text", "required": true, "default_value": ""},
        {"key": "TESTEMUNHA_1_NOME", "label": "Testemunha 1 - Nome", "type": "text", "required": false, "default_value": ""},
        {"key": "TESTEMUNHA_1_CPF", "label": "Testemunha 1 - CPF", "type": "text", "required": false, "default_value": ""},
        {"key": "TESTEMUNHA_2_NOME", "label": "Testemunha 2 - Nome", "type": "text", "required": false, "default_value": ""},
        {"key": "TESTEMUNHA_2_CPF", "label": "Testemunha 2 - CPF", "type": "text", "required": false, "default_value": ""}
      ]
    }
  ]',
  '<h2>INSTRUMENTO PARTICULAR DE CONTRATO DE LICENCIAMENTO DE MARCA, PROTOCOLO EXCLUSIVO E TRANSFERÊNCIA DE KNOW-HOW</h2>
  <p>Pelo presente instrumento particular, de um lado:</p>
  <p><strong>LICENCIANTE:</strong> <strong>BODY HARMONY EDUCAÇÃO LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº <strong>55.658.939/0001-30</strong>, com sede na Rua Capitão Francisco de Castro, nº 149, Centro, CEP 19.800-130, no município de Assis, Estado de São Paulo, neste ato representada na forma de seus atos constitutivos.</p>
  <p>E, de outro lado:</p>
  <p><strong>LICENCIADA:</strong> <strong>{{LICENCIADA_NOME_RAZAO}}</strong>, inscrita no CNPJ/MF ou CPF sob o nº <strong>{{LICENCIADA_CNPJ_CPF}}</strong>, com endereço em {{LICENCIADA_ENDERECO_COMPLETO}}, neste ato representada por <strong>{{LICENCIADA_REPRESENTANTE}}</strong>, {{LICENCIADA_NACIONALIDADE}}, {{LICENCIADA_ESTADO_CIVIL}}, {{LICENCIADA_PROFISSAO}}, portadora do RG nº {{LICENCIADA_RG}} e CPF/MF sob o nº {{LICENCIADA_CPF}}.</p>
  <h3>CLÁUSULA PRIMEIRA – DO OBJETO</h3>
  <p>1.1. O presente contrato tem por objeto a outorga, pela LICENCIANTE à LICENCIADA, de licença não exclusiva de uso da marca <strong>BODY HARMONY®</strong>, bem como a transferência do know-how técnico e autorização para execução dos protocolos estéticos corporais patenteados e desenvolvidos pela LICENCIANTE.</p>
  <h3>CLÁUSULA SEGUNDA – DA TERRITORIALIDADE</h3>
  <p>2.1. A LICENCIADA atuará exclusivamente na delimitação territorial correspondente a <strong>{{DELIMITACAO_TERRITORIAL}}</strong>, operando no endereço: <strong>{{ENDERECO_OPERACIONAL}}</strong>.</p>
  <h3>CLÁUSULA TERCEIRA – DAS CONDIÇÕES FINANCEIRAS</h3>
  <p>3.1. Pela outorga da presente licença, a LICENCIADA pagará à LICENCIANTE a Taxa Inicial de Licenciamento no valor de <strong>R$ {{TAXA_INICIAL_NUM}} ({{TAXA_INICIAL_EXTENSO}})</strong>, mediante {{CONDICOES_PAGAMENTO}}.</p>
  <p>3.2. A LICENCIADA compromete-se a respeitar o piso mínimo comercial de <strong>R$ {{VALOR_MINIMO_SESSAO}}</strong> por sessão de atendimento dos protocolos oficiais.</p>
  <h3>CLÁUSULA QUARTA – DA CONFIDENCIALIDADE E NÃO CONCORRÊNCIA</h3>
  <p>4.1. Todas as informações técnicas, métodos, formulações e apostilas fornecidas são estritamente confidenciais, aplicando-se cláusula de não concorrência e sigilo pelo período mínimo de 2 (dois) anos após o término deste instrumento.</p>
  <h3>CLÁUSULA QUINTA – DO FORO</h3>
  <p>5.1. Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o Foro da Comarca de <strong>{{CIDADE_CELEBRACAO}}</strong>, com renúncia expressa a qualquer outro.</p>
  <p style="margin-top: 30px;">{{CIDADE_CELEBRACAO}}, {{DATA_CELEBRACAO_EXTENSO}}.</p>',
  1
) ON DUPLICATE KEY UPDATE title=VALUES(title), content_html=VALUES(content_html);

-- 2. Ouvinte (Termo de Ouvinte e Confidencialidade)
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`)
VALUES (
  'termo-ouvinte-confidencialidade',
  'Termo de Ouvinte, Sigilo e Confidencialidade',
  'Ouvinte',
  'Termo formal para participantes ouvintes em cursos, workshops e imersões da Body Harmony com cláusula rigorosa de sigilo e não reprodução.',
  'v1.0',
  NULL,
  '<h2>TERMO DE COMPROMISSO, PARTICIPAÇÃO COMO OUVINTE E CONFIDENCIALIDADE</h2>
  <p>Pelo presente termo, Eu, <strong>{{NOME_OUVINTE}}</strong>, nacionalidade {{NACIONALIDADE_OUVINTE}}, estado civil {{ESTADO_CIVIL_OUVINTE}}, profissão {{PROFISSAO_OUVINTE}}, portador(a) do RG nº {{RG_OUVINTE}} e inscrito(a) no CPF sob o nº <strong>{{CPF_OUVINTE}}</strong>, residente e domiciliado(a) em {{ENDERECO_OUVINTE}}, telefone {{TELEFONE_OUVINTE}} e e-mail {{EMAIL_OUVINTE}}.</p>
  <p>Na qualidade de <strong>PARTICIPANTE OUVINTE</strong> do curso/treinamento <strong>{{NOME_CURSO_EVENTO}}</strong>, ministrado pela <strong>BODY HARMONY EDUCAÇÃO LTDA (CNPJ 55.658.939/0001-30)</strong>, declaro e assumo o compromisso irrevogável de:</p>
  <h3>1. DO CARÁTER EXCLUSIVAMENTE OBSERVATÓRIO</h3>
  <p>Reconheço que minha participação se restringe à condição de ouvinte, não me conferindo direito de certificação técnica habilitante para execução em terceiros, salvo expressa autorização formal da Licenciante.</p>
  <h3>2. DO SIGILO PROFISSIONAL E PROPRIEDADE INTELECTUAL</h3>
  <p>Comprometo-me a manter absoluto sigilo sobre todo e qualquer material didático, manobras, técnicas, tabelas e informações confidenciais a que tiver acesso durante a transmissão ou encontro presencial, sendo vedada a gravação de áudio/vídeo, cópia, reprodução ou compartilhamento por qualquer meio.</p>
  <h3>3. DAS PENALIDADES</h3>
  <p>O descumprimento injustificado das obrigações de sigilo sujeitará o infrator às medidas judiciais cabíveis na esfera cível e criminal, além de indenização por perdas e danos.</p>
  <p style="margin-top: 30px;">{{CIDADE_CELEBRACAO}}, {{DATA_EXTENSO}}.</p>',
  1
) ON DUPLICATE KEY UPDATE title=VALUES(title), content_html=VALUES(content_html);

-- 3. Cursos e Eventos
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`)
VALUES (
  'termo-workshop-evento',
  'Termo de Participação em Workshop e Imersão Presencial',
  'Cursos e Eventos',
  'Regulamento e contrato de matrícula para alunas de cursos presenciais, imersões e workshops VIP.',
  'v1.0',
  NULL,
  '<h2>CONTRATO DE MATRÍCULA E TERMO DE PARTICIPAÇÃO EM EVENTO PRESENCIAL</h2>
  <p><strong>ORGANIZADORA:</strong> BODY HARMONY EDUCAÇÃO LTDA, CNPJ 55.658.939/0001-30, Assis/SP.</p>
  <p><strong>ALUNA / PARTICIPANTE:</strong> <strong>{{NOME_ALUNA}}</strong>, CPF: <strong>{{CPF_ALUNA}}</strong>, Telefone: {{TELEFONE_ALUNA}}, E-mail: {{EMAIL_ALUNA}}.</p>
  <h3>OBJETO DO EVENTO</h3>
  <p>Participação no evento: <strong>{{TITULO_DO_EVENTO}}</strong>, a ser realizado no dia <strong>{{DATA_DO_EVENTO}}</strong>, no local: {{LOCAL_DO_EVENTO}}.</p>
  <h3>CONDIÇÕES GERAIS</h3>
  <p>1. O investimento totaliza <strong>R$ {{VALOR_INVESTIMENTO}}</strong>, pago via {{FORMA_PAGAMENTO}}.</p>
  <p>2. A participante declara estar ciente do regulamento interno do evento e autoriza a gravação e registros fotográficos para fins institucionais.</p>
  <p style="margin-top: 30px;">{{CIDADE_CELEBRACAO}}, {{DATA_EXTENSO}}.</p>',
  1
) ON DUPLICATE KEY UPDATE title=VALUES(title), content_html=VALUES(content_html);

-- 4. Clinica e Pacientes
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`)
VALUES (
  'termo-consentimento-imagem',
  'Termo de Consentimento Livre e Esclarecido (TCLE) & Uso de Imagem',
  'Clinica e Pacientes',
  'Termo médico-estético de consentimento informado de procedimentos corporais e autorização de registros de antes e depois.',
  'v1.0',
  NULL,
  '<h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE) E AUTORIZAÇÃO DE IMAGEM</h2>
  <p>Eu, <strong>{{NOME_PACIENTE}}</strong>, CPF nº <strong>{{CPF_PACIENTE}}</strong>, telefone {{TELEFONE_PACIENTE}}, declaro que fui devidamente informada sobre o protocolo estético <strong>{{NOME_PROCEDIMENTO}}</strong>.</p>
  <h3>1. INFORMAÇÕES SOBRE O PROCEDIMENTO</h3>
  <p>Declaro que recebi todas as orientações sobre indicações, contraindicações e cuidados pós-procedimento, tendo esclarecido todas as minhas dúvidas com a profissional responsável <strong>{{NOME_PROFISSIONAL}}</strong>.</p>
  <h3>2. AUTORIZAÇÃO DE USO DE IMAGEM</h3>
  <p>Autorizo expressamente a captação de registros fotográficos e em vídeo das áreas tratadas para fins de acompanhamento clínico e divulgação científica/estética em redes sociais da clínica.</p>
  <p style="margin-top: 30px;">{{CIDADE_CELEBRACAO}}, {{DATA_EXTENSO}}.</p>',
  1
) ON DUPLICATE KEY UPDATE title=VALUES(title), content_html=VALUES(content_html);

-- 5. Recibos
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`)
VALUES (
  'recibo-quitacao',
  'Recibo Oficial de Quitação e Pagamento',
  'Recibos',
  'Comprovante formal de recebimento e quitação de taxas de licenciamento, mentorias ou procedimentos.',
  'v1.0',
  NULL,
  '<h2>RECIBO OFICIAL DE QUITAÇÃO DE PAGAMENTO</h2>
  <p style="font-size: 14pt; text-align: center; font-weight: bold; color: #0A3E60;">VALOR: R$ {{VALOR_RECEBIDO_NUM}}</p>
  <p>Recebemos de <strong>{{NOME_PAGADOR}}</strong>, inscrito(a) no CPF/CNPJ nº <strong>{{DOCUMENTO_PAGADOR}}</strong>, a importância de <strong>R$ {{VALOR_RECEBIDO_NUM}} ({{VALOR_RECEBIDO_EXTENSO}})</strong>.</p>
  <p>Referente ao pagamento de: <strong>{{DESCRICAO_REFERENCIA}}</strong>, realizado na data de {{DATA_PAGAMENTO}} através de {{MEIO_PAGAMENTO}}.</p>
  <p>Damos por este instrumento plena, rasa e irrevogável quitação do valor supra especificado.</p>
  <p style="margin-top: 30px;">{{CIDADE_CELEBRACAO}}, {{DATA_EXTENSO}}.</p>',
  1
) ON DUPLICATE KEY UPDATE title=VALUES(title), content_html=VALUES(content_html);

-- 6. Parcerias
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`)
VALUES (
  'termo-parceria-clinica',
  'Termo de Parceria e Cooperação Profissional',
  'Parcerias',
  'Instrumento de parceria estratégica entre a Body Harmony e clínicas, médicas ou profissionais parceiros.',
  'v1.0',
  NULL,
  '<h2>TERMO DE PARCERIA E COOPERAÇÃO TÉCNICO-ESTÉTICA</h2>
  <p>Pelo presente instrumento, de um lado <strong>BODY HARMONY EDUCAÇÃO LTDA (CNPJ 55.658.939/0001-30)</strong> e de outro lado <strong>{{NOME_PARCEIRO}}</strong>, CNPJ/CPF: <strong>{{DOCUMENTO_PARCEIRO}}</strong>, estabelecido em {{ENDERECO_PARCEIRO}}.</p>
  <h3>1. DO ESCOPO DA PARCERIA</h3>
  <p>As partes celebram parceria para cooperação mútua na realização e encaminhamento de atendimentos e projetos conjuntos no segmento de estética avançada na região de <strong>{{REGIAO_ATUACAO}}</strong>.</p>
  <h3>2. DAS CONDIÇÕES COMERCIAIS</h3>
  <p>O repasse financeiro e participação nas sessões respeitará a proporção de <strong>{{PERCENTUAL_REPASSE}}</strong>, com acerto mensal até o 5º dia útil.</p>
  <p style="margin-top: 30px;">{{CIDADE_CELEBRACAO}}, {{DATA_EXTENSO}}.</p>',
  1
) ON DUPLICATE KEY UPDATE title=VALUES(title), content_html=VALUES(content_html);
