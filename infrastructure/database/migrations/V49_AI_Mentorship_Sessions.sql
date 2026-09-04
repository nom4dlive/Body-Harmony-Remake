-- migration for ai_mentorship_sessions
CREATE TABLE IF NOT EXISTS ai_mentorship_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    licenciada_id INT NOT NULL,
    session_data JSON,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_licenciada (licenciada_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;