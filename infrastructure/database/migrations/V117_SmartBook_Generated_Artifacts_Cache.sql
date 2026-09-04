-- V117: Cache de Materiais e Transformações Geradas no Smart Book
-- Nexus Protocol V3.1 — PLAN-116: 1-Click Interactive Tools & Caching

CREATE TABLE IF NOT EXISTS smartbook_generated_artifacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    transformation_key VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_markdown LONGTEXT NOT NULL,
    content_json LONGTEXT NULL,
    generated_by_licenciada_id INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_module_trans (module_id, transformation_key),
    INDEX idx_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
