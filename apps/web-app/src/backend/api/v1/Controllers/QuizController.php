<?php
// api/v1/Controllers/QuizController.php

class QuizController {
    private $pdo;
    private $user;

    public function __construct() {
        global $pdo, $loggedUser, $loggedAluna;
        $this->pdo = $pdo;
        $this->user = $loggedUser ?: $loggedAluna;
        
        if (!$this->user) {
            Response::error('Unauthorized access. Please login.', 401);
        }
    }


    // === ADMIN METHODS ===

    // GET /admin/quiz?module_id=X
    public function getAdminQuiz($moduleId) {
        $role = $this->user['role'] ?? '';
        $isAdmin = (isset($this->user['is_admin']) && $this->user['is_admin']) || $role === 'superadmin' || $role === 'admin';
        if (!$isAdmin) Response::error('Unauthorized', 403);
        
        try {
            // Get Quiz Metadata
            $stmt = $this->pdo->prepare("SELECT * FROM lms_quizzes WHERE module_id = ?");
            $stmt->execute([$moduleId]);
            $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$quiz) {
                Response::json(['quiz' => null]);
                return;
            }

            // Get Questions
            $stmtQ = $this->pdo->prepare("SELECT * FROM lms_questions WHERE quiz_id = ? ORDER BY order_index ASC");
            $stmtQ->execute([$quiz['id']]);
            $questions = $stmtQ->fetchAll(PDO::FETCH_ASSOC);

            // Get Options
            foreach ($questions as &$q) {
                $stmtO = $this->pdo->prepare("SELECT * FROM lms_question_options WHERE question_id = ?");
                $stmtO->execute([$q['id']]);
                $q['options'] = $stmtO->fetchAll(PDO::FETCH_ASSOC);
            }

            Response::json(['quiz' => $quiz, 'questions' => $questions]);

        } catch (PDOException $e) {
            Response::error('DB Error: ' . $e->getMessage());
        }
    }

    // POST /admin/quiz (Save/Update)
    public function saveQuiz() {
        if (!$this->user['is_admin']) Response::error('Unauthorized', 403);

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) Response::error('Invalid JSON');

        $moduleId = $input['module_id'];
        $title = $input['title'];
        $minScore = $input['min_score'] ?? 70;
        $questions = $input['questions'] ?? [];

        try {
            $this->pdo->beginTransaction();

            // 1. Upsert Quiz
            $stmtCheck = $this->pdo->prepare("SELECT id FROM lms_quizzes WHERE module_id = ?");
            $stmtCheck->execute([$moduleId]);
            $existing = $stmtCheck->fetchColumn();

            if ($existing) {
                $quizId = $existing;
                $stmtUpd = $this->pdo->prepare("UPDATE lms_quizzes SET title = ?, min_score = ? WHERE id = ?");
                $stmtUpd->execute([$title, $minScore, $quizId]);
            } else {
                $stmtIns = $this->pdo->prepare("INSERT INTO lms_quizzes (module_id, title, min_score) VALUES (?, ?, ?)");
                $stmtIns->execute([$moduleId, $title, $minScore]);
                $quizId = $this->pdo->lastInsertId();
            }

            // 2. Sync Questions (Full Refresh Strategy for simplicity or ID matching?)
            // For simplicity in this phase, we keep IDs if provided, else insert.
            // But deleting removed questions is tricky without sophisticated diffing.
            // "Full Refresh" (Delete All -> Insert New) is dangerous if we had stats, but here schema is new.
            // Improved Strategy: Update existing by ID, Insert new, Delete missing.
            
            $validQIds = [];

            foreach ($questions as $idx => $q) {
                if (isset($q['id']) && $q['id']) {
                    // Update
                    $stmtQu = $this->pdo->prepare("UPDATE lms_questions SET text = ?, type = ?, order_index = ? WHERE id = ? AND quiz_id = ?");
                    $stmtQu->execute([$q['text'], $q['type'], $idx, $q['id'], $quizId]);
                    $qId = $q['id'];
                } else {
                    // Insert
                    $stmtQi = $this->pdo->prepare("INSERT INTO lms_questions (quiz_id, text, type, order_index) VALUES (?, ?, ?, ?)");
                    $stmtQi->execute([$quizId, $q['text'], $q['type'], $idx]);
                    $qId = $this->pdo->lastInsertId();
                }
                $validQIds[] = $qId;

                // Sync Options
                // Delete old options for this question (easier than diffing options)
                $this->pdo->prepare("DELETE FROM lms_question_options WHERE question_id = ?")->execute([$qId]);

                foreach ($q['options'] as $opt) {
                    $stmtOi = $this->pdo->prepare("INSERT INTO lms_question_options (question_id, text, is_correct) VALUES (?, ?, ?)");
                    $stmtOi->execute([$qId, $opt['text'], $opt['is_correct'] ? 1 : 0]);
                }
            }

            // Cleanup removed questions
            if (!empty($validQIds)) {
                $placeholders = implode(',', array_fill(0, count($validQIds), '?'));
                $stmtDel = $this->pdo->prepare("DELETE FROM lms_questions WHERE quiz_id = ? AND id NOT IN ($placeholders)");
                $stmtDel->execute(array_merge([$quizId], $validQIds));
            } else {
                 // No questions provided? Delete all?
                 $stmtDel = $this->pdo->prepare("DELETE FROM lms_questions WHERE quiz_id = ?");
                 $stmtDel->execute([$quizId]);
            }

            $this->pdo->commit();
            Response::json(['status' => 'success', 'quiz_id' => $quizId]);

        } catch (Exception $e) {
            $this->pdo->rollBack();
            Response::error('Save Failed: ' . $e->getMessage());
        }
    }

    // === STUDENT METHODS ===

    // GET /lms/quiz?module_id=X
    public function getStudentQuiz($moduleId) {
        try {
            // Get Quiz
            $stmt = $this->pdo->prepare("SELECT id, title, description, min_score FROM lms_quizzes WHERE module_id = ?");
            $stmt->execute([$moduleId]);
            $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$quiz) {
                Response::error('Quiz not found', 404);
            }

            // Get Last Attempt
            $isAluna = (isset($this->user['role']) && $this->user['role'] === 'aluna');
            $sqlAtt = $isAluna 
                ? "SELECT * FROM lms_quiz_attempts WHERE quiz_id = ? AND aluna_id = ? ORDER BY attempted_at DESC LIMIT 1"
                : "SELECT * FROM lms_quiz_attempts WHERE quiz_id = ? AND licenciada_id = ? ORDER BY attempted_at DESC LIMIT 1";
            $stmtAtt = $this->pdo->prepare($sqlAtt);
            $stmtAtt->execute([$quiz['id'], $this->user['id']]);
            $lastAttempt = $stmtAtt->fetch(PDO::FETCH_ASSOC);

            // Get Questions (Hide correct flag)
            $stmtQ = $this->pdo->prepare("SELECT id, text, type, image_ref FROM lms_questions WHERE quiz_id = ? ORDER BY order_index ASC");
            $stmtQ->execute([$quiz['id']]);
            $questions = $stmtQ->fetchAll(PDO::FETCH_ASSOC);

            foreach ($questions as &$q) {
                $stmtO = $this->pdo->prepare("SELECT id, text FROM lms_question_options WHERE question_id = ?");
                $stmtO->execute([$q['id']]);
                $q['options'] = $stmtO->fetchAll(PDO::FETCH_ASSOC);
            }

            Response::json([
                'quiz' => $quiz,
                'questions' => $questions,
                'last_attempt' => $lastAttempt
            ]);

        } catch (PDOException $e) {
            Response::error('DB Error: ' . $e->getMessage());
        }
    }

    // POST /lms/quiz/submit
    public function submitQuiz() {
        $input = json_decode(file_get_contents('php://input'), true);
        $quizId = $input['quiz_id'];
        $answers = $input['answers']; // { question_id: option_id }

        try {
            $stmtQ = $this->pdo->prepare("SELECT id, min_score FROM lms_quizzes WHERE id = ?");
            $stmtQ->execute([$quizId]);
            $quiz = $stmtQ->fetch(PDO::FETCH_ASSOC);

            if (!$quiz) Response::error('Quiz not found', 404);

            // Calculate Score
            $totalQuestions = 0;
            $correctCount = 0;
            
            // Get Answer Key
            $stmtKey = $this->pdo->prepare("
                SELECT q.id as q_id, o.id as o_id
                FROM lms_questions q
                JOIN lms_question_options o ON o.question_id = q.id
                WHERE q.quiz_id = ? AND o.is_correct = 1
            ");
            $stmtKey->execute([$quizId]);
            $keyRows = $stmtKey->fetchAll(PDO::FETCH_ASSOC);
            
            // Map keys
            $correctAnswers = []; // q_id => [o_id] (multichoice future proof)
            foreach($keyRows as $row) {
                $correctAnswers[$row['q_id']] = $row['o_id'];
            }
            
            // Count
            // Note: This logic assumes single choice.
            // We should reload question count to be sure we cover all questions.
            $stmtCount = $this->pdo->prepare("SELECT COUNT(*) FROM lms_questions WHERE quiz_id = ?");
            $stmtCount->execute([$quizId]);
            $totalQuestions = $stmtCount->fetchColumn();

            if ($totalQuestions == 0) $score = 100; // Empty quiz?
            else {
                foreach ($answers as $qId => $oId) {
                    if (isset($correctAnswers[$qId]) && $correctAnswers[$qId] == $oId) {
                        $correctCount++;
                    }
                }
                $score = ($correctCount / $totalQuestions) * 100;
            }

            $passed = $score >= $quiz['min_score'];

            // Save Attempt
            $isAluna = (isset($this->user['role']) && $this->user['role'] === 'aluna');
            $licenciadaId = $isAluna ? null : $this->user['id'];
            $alunaId = $isAluna ? $this->user['id'] : null;
            $stmtIns = $this->pdo->prepare("INSERT INTO lms_quiz_attempts (licenciada_id, aluna_id, quiz_id, score, passed, answers_json) VALUES (?, ?, ?, ?, ?, ?)");
            $stmtIns->execute([$licenciadaId, $alunaId, $quizId, $score, $passed ? 1 : 0, json_encode($answers)]);

            Response::json([
                'score' => $score,
                'passed' => $passed,
                'min_score' => $quiz['min_score'],
                'correct_count' => $correctCount,
                'total' => $totalQuestions,
                'feedback' => $passed ? 'Parabéns! Você foi aprovado.' : 'Tente novamente.'
            ]);

        } catch (PDOException $e) {
            Response::error('Submit Error: ' . $e->getMessage());
        }
    }
}
