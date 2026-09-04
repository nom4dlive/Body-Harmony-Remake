-- Migration V112: Add payment_link_url to shop_products
-- Author: Nexus Era V3.1 / Antigravity
-- Description: Adiciona suporte a Links de Pagamento oficiais da Stone com captura previa de leads no CRM.

ALTER TABLE `shop_products`
ADD COLUMN IF NOT EXISTS `payment_link_url` VARCHAR(500) NULL AFTER `image_url`;
