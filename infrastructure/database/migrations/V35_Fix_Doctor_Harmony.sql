-- Migration V35: Add doctor_harmony_response to ai_clinical_cases

-- FIX: Ensure database selection for manual imports
USE u388974772_bodyharmony_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS upgrade_ai_clinical_cases_v35 $$

CREATE PROCEDURE upgrade_ai_clinical_cases_v35()
BEGIN
    -- Add doctor_harmony_response if not exists
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'ai_clinical_cases' 
        AND COLUMN_NAME = 'doctor_harmony_response'
    ) THEN
        ALTER TABLE ai_clinical_cases 
        ADD COLUMN doctor_harmony_response TEXT DEFAULT NULL AFTER photo_path;
    END IF;

    -- Add mentor_feedback if not exists
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'ai_clinical_cases' 
        AND COLUMN_NAME = 'mentor_feedback'
    ) THEN
        ALTER TABLE ai_clinical_cases
        ADD COLUMN mentor_feedback TEXT DEFAULT NULL AFTER doctor_harmony_response;
    END IF;
END $$

DELIMITER ;

CALL upgrade_ai_clinical_cases_v35();
DROP PROCEDURE IF EXISTS upgrade_ai_clinical_cases_v35;
