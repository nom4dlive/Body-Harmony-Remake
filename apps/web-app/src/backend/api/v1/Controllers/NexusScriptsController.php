<?php
// NexusScriptsController.php

require_once __DIR__ . '/../Services/MediaSyncService.php';

class NexusScriptsController {
    private $pdo;
    private $user;
    
    public function __construct() {
        global $pdo, $loggedUser;
        $this->pdo = $pdo;
        $this->user = $loggedUser;
    }
    
    public function listScripts() {
        Response::json([
            'success' => true,
            'scripts' => [
                [
                    'id' => 'sync-media-files',
                    'name' => 'Sync Media Files',
                    'description' => 'Sincroniza arquivos de mídia do servidor com o banco de dados',
                    'category' => 'media',
                    'icon' => '📁',
                    'params' => [
                        [
                            'name' => 'category',
                            'label' => 'Categoria',
                            'type' => 'select',
                            'default' => 'all',
                            'options' => [
                                ['value' => 'all', 'label' => 'Todas'],
                                ['value' => 'thumbnails', 'label' => 'Thumbnails'],
                                ['value' => 'lessons', 'label' => 'Aulas'],
                                ['value' => 'resources', 'label' => 'Recursos'],
                                ['value' => 'profiles', 'label' => 'Perfis']
                            ]
                        ],
                        [
                            'name' => 'dry_run',
                            'label' => 'Modo Preview (Dry Run)',
                            'type' => 'boolean',
                            'default' => false,
                            'description' => 'Simula a execução sem modificar o banco de dados'
                        ],
                        [
                            'name' => 'prune',
                            'label' => 'Limpar Órfãos (Prune)',
                            'type' => 'boolean',
                            'default' => false,
                            'description' => 'Remove do banco arquivos que não existem mais no disco'
                        ]
                    ], 
                [   
                    'id' => 'sync-licensee-photos',
                    'name' => 'Sincronizar Fotos (Instagram)',
                    'description' => 'Atualiza fotos/URLs baseando-se no backup enviado (Instagram/Match)',
                    'category' => 'media',
                    'icon' => '📸',
                    'params' => [
                         [
                            'name' => 'dry_run',
                            'label' => 'Modo Teste (Sem Alterar DB)',
                            'type' => 'boolean',
                            'default' => true
                         ]
                    ]
                ]
                ]
            ]
        ]);
    }
    
    public function executeScript() {
        $input = json_decode(file_get_contents('php://input'), true);
        $scriptId = $input['script_id'] ?? '';
        $params = $input['params'] ?? [];
        
        if (!$scriptId) {
            Response::error('script_id is required', 400);
            return;
        }
        
        $executionId = $this->startExecution($scriptId, $params);
        
        try {
            $startTime = microtime(true);
            
            $result = match($scriptId) {
                'sync-media-files' => $this->executeSyncMediaFiles($params),
                'sync-licensee-photos' => $this->executeSyncLicenseePhotos($params),
                default => throw new Exception("Unknown script: $scriptId")
            };
            
            $duration = round((microtime(true) - $startTime) * 1000);
            $this->completeExecution($executionId, 'success', $result, null, $duration);
            
            Response::json([
                'success' => true,
                'execution_id' => $executionId,
                'result' => $result,
                'duration_ms' => $duration
            ]);
            
        } catch (Exception $e) {
            $duration = round((microtime(true) - $startTime) * 1000);
            $this->completeExecution($executionId, 'error', null, $e->getMessage(), $duration);
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function getHistory() {
        $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
        $scriptId = $_GET['script_id'] ?? null;
        
        $sql = "
            SELECT se.*, a.username as executed_by_name
            FROM script_executions se
            LEFT JOIN admin_users a ON se.executed_by = a.id
        ";
        
        $params = [];
        
        if ($scriptId) {
            $sql .= " WHERE script_id = ?";
            $params[] = $scriptId;
        }
        
        $sql .= " ORDER BY executed_at DESC LIMIT ?";
        $params[] = $limit;
        
        $stmt = $this->pdo->prepare($sql);
        
        // Bind limit as integer explicitly
        if ($scriptId) {
            $stmt->bindValue(1, $scriptId, PDO::PARAM_STR);
            $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        } else {
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        $executions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($executions as &$exec) {
            $exec['params'] = json_decode($exec['params'], true);
            $exec['result'] = json_decode($exec['result'], true);
        }
        
        Response::json(['success' => true, 'executions' => $executions]);
    }
    
    private function executeSyncMediaFiles($params) {
        $service = new MediaSyncService($this->pdo);
        return $service->syncFiles(
            $params['category'] ?? 'all', 
            $params['dry_run'] ?? false,
            $params['prune'] ?? false
        );
    }

    private function executeSyncLicenseePhotos($params) {
        $dryRun = $params['dry_run'] ?? false;
        $scanDir = PUBLIC_UPLOADS_DIR . '/licenciadas';
        
        if (!is_dir($scanDir)) {
            throw new Exception("Diretório não encontrado: $scanDir");
        }

        $files = scandir($scanDir);
        $fileMap = [];
        foreach ($files as $f) {
            if ($f === '.' || $f === '..') continue;
            // Normalize: remove extension and @, lowercase
            $clean = str_replace(['.png', '.jpg', '.jpeg', '@'], ['', '', '', ''], strtolower($f));
            $fileMap[$clean] = $f;
        }

        $stmt = $this->pdo->query("SELECT id, username, instagram, photo_url FROM licenciadas WHERE is_active = 1");
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stats = [
            'total_students' => count($students),
            'files_found' => count($fileMap),
            'matched' => 0,
            'updated' => 0,
            'missing' => 0,
            'logs' => []
        ];

        foreach ($students as $s) {
            $instaClean = str_replace('@', '', strtolower($s['instagram'] ?? ''));
            $userClean = strtolower($s['username'] ?? '');
            
            $match = null;
            $method = '';

            if ($instaClean && isset($fileMap[$instaClean])) {
                $match = $fileMap[$instaClean];
                $method = 'Instagram';
            } elseif ($userClean && isset($fileMap[$userClean])) {
                $match = $fileMap[$userClean];
                $method = 'Username';
            }

            if ($match) {
                $stats['matched']++;
                $newUrl = "/uploads/licenciadas/$match";
                
                if ($s['photo_url'] !== $newUrl) {
                    if (!$dryRun) {
                        $this->pdo->prepare("UPDATE licenciadas SET photo_url = ? WHERE id = ?")
                            ->execute([$newUrl, $s['id']]);
                    }
                    $stats['updated']++;
                    $stats['logs'][] = "✅ [Updated] {$s['username']} -> $match ($method)";
                } else {
                    $stats['logs'][] = "ℹ️ [Skipped] {$s['username']} já está correto.";
                }
            } else {
                $stats['missing']++;
                $stats['logs'][] = "❌ [Missing] {$s['username']} (@{$s['instagram']}) - Sem foto correspondente.";
            }
        }

        return $stats;
    }
    
    private function startExecution($scriptId, $params) {
        $stmt = $this->pdo->prepare("
            INSERT INTO script_executions (script_id, executed_by, params, status)
            VALUES (?, ?, ?, 'running')
        ");
        $stmt->execute([$scriptId, $this->user['id'], json_encode($params)]);
        return $this->pdo->lastInsertId();
    }
    
    private function completeExecution($id, $status, $result, $errorMessage, $duration) {
        $stmt = $this->pdo->prepare("
            UPDATE script_executions 
            SET status = ?, result = ?, error_message = ?, completed_at = NOW(), duration_ms = ?
            WHERE id = ?
        ");
        $stmt->execute([$status, json_encode($result), $errorMessage, $duration, $id]);
    }
}
