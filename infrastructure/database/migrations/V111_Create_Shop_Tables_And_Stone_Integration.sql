-- Migration: V111_Create_Shop_Tables_And_Stone_Integration.sql
-- Description: Criação das tabelas de catálogo de produtos, pedidos da Stone e leads da Loja Virtual Body Harmony
-- Author: Nexus Protocol V3.1

CREATE TABLE IF NOT EXISTS `shop_products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `tagline` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `long_description` LONGTEXT DEFAULT NULL,
  `price_cents` INT UNSIGNED NOT NULL DEFAULT 0,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Geral',
  `image_url` VARCHAR(500) DEFAULT NULL,
  `features_json` JSON DEFAULT NULL,
  `stock_limit` INT NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_products_slug (`slug`),
  INDEX idx_shop_products_category (`category`),
  INDEX idx_shop_products_active (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shop_orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `initiator_id` VARCHAR(100) NOT NULL UNIQUE,
  `product_id` INT UNSIGNED NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_cpf` VARCHAR(20) DEFAULT NULL,
  `customer_city` VARCHAR(100) DEFAULT NULL,
  `customer_neighborhood` VARCHAR(100) DEFAULT NULL,
  `amount_cents` INT UNSIGNED NOT NULL DEFAULT 0,
  `payment_method` ENUM('card', 'pix', 'boleto', 'manual') NOT NULL DEFAULT 'card',
  `installments` INT UNSIGNED NOT NULL DEFAULT 1,
  `payment_status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `stone_charge_id` VARCHAR(100) DEFAULT NULL,
  `stone_raw_response` LONGTEXT DEFAULT NULL,
  `pix_qr_code` TEXT DEFAULT NULL,
  `pix_copy_paste` TEXT DEFAULT NULL,
  `validated_by_admin_id` INT UNSIGNED NULL,
  `validated_at` DATETIME NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_orders_initiator (`initiator_id`),
  INDEX idx_shop_orders_stone_charge (`stone_charge_id`),
  INDEX idx_shop_orders_status (`payment_status`),
  INDEX idx_shop_orders_customer_email (`customer_email`),
  CONSTRAINT fk_shop_orders_product FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shop_leads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NULL,
  `product_id` INT UNSIGNED NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `neighborhood` VARCHAR(100) DEFAULT NULL,
  `offering_title` VARCHAR(255) NOT NULL,
  `status` ENUM('Novo', 'Contato', 'Proposta', 'Aguardando Pagamento', 'Pago', 'Cancelado') NOT NULL DEFAULT 'Novo',
  `value_cents` INT UNSIGNED NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_leads_status (`status`),
  INDEX idx_shop_leads_phone (`phone`),
  CONSTRAINT fk_shop_leads_order FOREIGN KEY (`order_id`) REFERENCES `shop_orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT fk_shop_leads_product FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeds Iniciais de Produtos
INSERT INTO `shop_products` (`slug`, `name`, `tagline`, `description`, `long_description`, `price_cents`, `category`, `image_url`, `features_json`, `stock_limit`, `is_active`, `sort_order`)
VALUES
('ingresso-vip', 'Ingresso VIP — Experience Limited', 'Acesso exclusivo aos bastidores, Josi & Karice, oportunidades de negócio e crédito em licenciamento.', 'Para quem quer ir além do congresso e ter acesso aos bastidores e às oportunidades de negócio da Body Harmony. Apenas 40 vagas.', 'O INGRESSO VIP é a experiência boutique definitiva do 1º Congresso Brasileiro de Musculação Elétrica Ativa. Garante acesso exclusivo aos bastidores com as fundadoras Josi e Karice, reuniões de negócios de alto nível e happy hour privado. CONDIÇÃO ESPECIAL: O valor integral de R$ 1.497 do ingresso VIP será revertido em crédito direto caso você feche o Licenciamento Territorial durante ou logo após o congresso.', 149700, 'Congresso & Evento', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200', JSON_ARRAY('🔥 Apenas 40 vagas VIP disponíveis', 'Acesso exclusivo aos bastidores com Josi e Karice', 'Oportunidades de negócios e parcerias estratégicas', '💡 Crédito integral de R$ 1.497 revertido na adesão ao Licenciamento', 'Happy Hour VIP & Networking Executivo Reservado'), 40, 1, 1),
('ingresso-experience', 'Ingresso Experience — Congresso Brasileiro', 'Acesso completo à imersão científica, tecnologia e evolução corporal integrativa.', 'A experiência essencial do maior encontro nacional de eletroestimulação muscular. Conecte-se com PhDs e pesquisadores da saúde.', 'O INGRESSO EXPERIENCE dá acesso livre a todas as palestras, painéis científicos e área de demonstrações tecnológicas do 1º Congresso Brasileiro de Musculação Elétrica Ativa. Inclui certificado oficial de participação e kit didático.', 69700, 'Congresso & Evento', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200', JSON_ARRAY('Credenciamento Oficial Congresso 2026', 'Acesso a todos os painéis com PhDs e pesquisadores', 'Demonstrações práticas de tecnologias de eletroestimulação', 'Kit Didático & Certificado Oficial de Participação'), 200, 1, 2),
('curso-academy', 'Formação Body Harmony Academy', 'Ciência corporal aplicada e funil de vendas direto.', 'Acelere seu faturamento entendendo a fundo a fisiologia integrada e executando técnicas de captação que lotam sua agenda.', 'O Academy ensina na prática a fisiologia e a gestão comercial de uma marca pessoal. São vídeo-aulas gravadas em alta definição, artigos clínicos e guias práticos para associar resultados biológicos rápidos a um plano de vendas direto.', 199700, 'Curso Online', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200', JSON_ARRAY('Acesso imediato de forma vitalícia à plataforma', 'Mais de 120 vídeo-aulas práticas gravadas em estúdio', 'Certificação nacional inclusa'), NULL, 1, 3),
('licenciamento', 'Licenciamento Body Harmony', 'Exclusividade territorial, marca reconhecida e faturamento garantido para clínicas.', 'A transição imediata da sua clínica para o modelo de alto ticket. Domine sua região e atraia pacientes dispostos a pagar até 4x mais.', 'O Licenciamento Body Harmony é para profissionais que querem aumentar seu faturamento com segurança. Ao se tornar uma licenciada, você recebe um território exclusivo garantido em contrato, acesso a protocolos clínicos testados e treinamento prático de equipe para vender pacotes comerciais de alto valor.', 1540000, 'Licenciamento', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200', JSON_ARRAY('Exclusividade de território blindada em contrato', 'Treinamento presencial clínico e comercial de equipe', 'Scripts comerciais validados para fechamento de pacotes'), NULL, 1, 4),
('body-harmony-summit', 'Body Harmony Summit', 'Dois dias de imersão de negócios e conexões em São Paulo.', 'Conecte-se com as maiores referências em estética integrativa do país e aprenda roteiros validados de escala comercial.', 'Uma imersão presencial focada 100% em vendas de estética corporal. Realizado em São Paulo, o evento reúne palestras sobre captação ativa de clientes e abre espaço para parcerias e network comercial entre profissionais.', 380000, 'Evento Presencial', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200', JSON_ARRAY('Credencial VIP com acesso livre a todas as palestras', 'Almoços e jantares de network inclusos no local', 'Conexões diretas com donas de clínicas'), 100, 1, 5),
('mentoria-private', 'Mentoria Private Body Harmony', 'O plano individual sob medida para faturar múltiplos 6 dígitos.', 'Acompanhamento pessoal de perto por 6 meses para estruturar seu modelo de consultório, refinar suas vendas de pacotes e acelerar o retorno.', 'A Mentoria Private coloca você em contato direto com nosso comitê para desenhar o seu plano comercial personalizado. Trabalhamos para eliminar desperdícios operacionais, elevar os preços de forma segura e atrair clientes todos os dias.', 1500000, 'Mentoria', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200', JSON_ARRAY('Acesso direto ao WhatsApp do comitê por 6 meses', 'Reuniões individuais quinzenais pela internet', 'Scripts autorais para triplicar suas conversões'), 10, 1, 6)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `price_cents` = VALUES(`price_cents`);
