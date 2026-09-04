<?php
// MediaSyncService.php - Reusable media sync logic

class MediaSyncService {
    private $pdo;
    private $basePath;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        // $this->basePath = __DIR__ . '/../../../../../../private_uploads/';
        $this->basePath = PRIVATE_UPLOADS_DIR . '/';
    }
    
    public function syncFiles($category = 'all', $dryRun = false, $prune = false) {
        $categories = $this->getCategories($category);
        $stats = ['scanned' => 0, 'synced' => 0, 'skipped' => 0, 'pruned' => 0, 'errors' => 0, 'details' => []];
        
        // 1. Sync / Add new files
        foreach ($categories as $folder => $dbCategory) {
            $dir = $this->basePath . $folder . '/';
            if (!is_dir($dir)) {
                $stats['details'][] = "⚠️ Directory not found: $folder";
                continue;
            }
            
            $files = scandir($dir);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..' || !is_file($dir . $file)) continue;
                
                $stats['scanned']++;
                $relativePath = $folder . '/' . $file;
                
                try {
                    // Check if exists
                    $stmt = $this->pdo->prepare("SELECT id FROM media_files WHERE file_path = ?");
                    $stmt->execute([$relativePath]);
                    
                    if ($stmt->fetch()) {
                        $stats['skipped']++;
                        // $stats['details'][] = "⏭️ Skipped: $relativePath";
                        continue;
                    }
                    
                    $fullPath = $dir . $file;
                    $mimeType = mime_content_type($fullPath);
                    $fileSize = filesize($fullPath);
                    $width = $height = null;
                    
                    if (strpos($mimeType, 'image/') === 0) {
                        $imageInfo = @getimagesize($fullPath);
                        if ($imageInfo) {
                            $width = $imageInfo[0];
                            $height = $imageInfo[1];
                        }
                    }
                    
                    if ($dryRun) {
                        $stats['synced']++;
                        $stats['details'][] = "🔍 [DRY RUN] Would sync: $relativePath (" . $this->formatBytes($fileSize) . ")";
                        continue;
                    }
                    
                    $stmt = $this->pdo->prepare("
                        INSERT INTO media_files (file_path, file_name, file_type, file_size, media_category, width, height)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([$relativePath, $file, $mimeType, $fileSize, $dbCategory, $width, $height]);
                    
                    $stats['synced']++;
                    $stats['details'][] = "✅ Synced: $relativePath (" . $this->formatBytes($fileSize) . ")";
                    
                } catch (Exception $e) {
                    $stats['errors']++;
                    $stats['details'][] = "❌ Error: $relativePath - " . $e->getMessage();
                }
            }
        }

        // 2. Prune Orphans (if requested)
        if ($prune) {
            $stats['details'][] = "🧹 Starting Prune Process...";
            try {
                // Get all files from DB
                $stmt = $this->pdo->query("SELECT id, file_path FROM media_files");
                $allDbFiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($allDbFiles as $row) {
                    $fullPath = $this->basePath . $row['file_path'];
                    if (!file_exists($fullPath)) {
                        if ($dryRun) {
                            $stats['pruned']++;
                            $stats['details'][] = "🗑️ [DRY RUN] Would prune: {$row['file_path']}";
                        } else {
                            $delStmt = $this->pdo->prepare("DELETE FROM media_files WHERE id = ?");
                            $delStmt->execute([$row['id']]);
                            $stats['pruned']++;
                            $stats['details'][] = "🗑️ Pruned: {$row['file_path']}";
                        }
                    }
                }
            } catch (Exception $e) {
                $stats['errors']++;
                $stats['details'][] = "❌ Prune Error: " . $e->getMessage();
            }
        }
        
        return $stats;
    }
    
    private function getCategories($filter) {
        $all = ['thumbnails' => 'thumbnail', 'lessons' => 'lesson', 'resources' => 'resource', 'profiles' => 'profile'];
        if ($filter === 'all') return $all;
        if (isset($all[$filter])) return [$filter => $all[$filter]];
        throw new Exception("Invalid category: $filter");
    }
    
    private function formatBytes($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
