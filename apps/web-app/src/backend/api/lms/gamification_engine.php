<?php
// api/lms/gamification_engine.php

class GamificationEngine {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Award Points
    public function awardPoints($userId, $action, $refId = null) {
        $points = 0;
        switch ($action) {
            case 'lesson_completed': $points = 10; break;
            case 'module_completed': $points = 50; break;
            case 'daily_login': $points = 5; break;
        }

        if ($points > 0) {
            $stmt = $this->pdo->prepare("INSERT INTO lms_points_log (user_id, action, points, reference_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userId, $action, $points, $refId]);
        }
        
        return $points;
    }

    // Check Badges
    public function checkBadges($userId) {
        $awarded = [];

        // 1. Check Module Completion Badges
        $stmt = $this->pdo->prepare("SELECT id, criteria_value FROM lms_badges WHERE criteria_type = 'module_completion'");
        $stmt->execute();
        $moduleBadges = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($moduleBadges as $badge) {
            // Check if user completed this module
            $moduleId = $badge['criteria_value'];
            // Simplified check: Get total lessons in module vs completed lessons
            // ... Logic ...
            // If completed, award badge
            if ($this->hasUserCompletedModule($userId, $moduleId)) {
                $this->awardBadge($userId, $badge['id']);
                $awarded[] = $badge['id'];
            }
        }

        return $awarded;
    }
    
    private function hasUserCompletedModule($userId, $moduleId) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM lms_lessons WHERE module_id = ?");
        $stmt->execute([$moduleId]);
        $total = $stmt->fetchColumn();
        
        if ($total == 0) return false;

        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) 
            FROM lms_progress p 
            JOIN lms_lessons l ON p.lesson_id = l.id 
            WHERE p.student_id = ? AND l.module_id = ? AND p.is_completed = 1
        ");
        $stmt->execute([$userId, $moduleId]);
        $completed = $stmt->fetchColumn();
        
        return $completed >= $total;
    }

    private function awardBadge($userId, $badgeId) {
        // Insert Ignore to avoid duplicates
        $stmt = $this->pdo->prepare("INSERT IGNORE INTO lms_user_badges (user_id, badge_id) VALUES (?, ?)");
        $stmt->execute([$userId, $badgeId]);
    }
    
    public function getUserPoints($userId) {
        $stmt = $this->pdo->prepare("SELECT SUM(points) FROM lms_points_log WHERE user_id = ?");
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }
}
