<?php
// api/v1/Controllers/MediaController.php

class MediaController {
    private $pdo;
    private $user;
    
    public function __construct() {
        global $pdo, $loggedUser;
        $this->pdo = $pdo;
        $this->user = $loggedUser;
    }
    
    /**
     * GET /admin/media/list
     * List media files with advanced filtering, search, and sorting
     * 
     * Query params:
     * - category: thumbnail|lesson|resource|profile (required)
     * - page, limit: pagination
     * - search: fuzzy search by filename
     * - date_from, date_to: filter by upload date (Y-m-d)
     * - min_size, max_size: filter by file size (bytes)
     * - min_width, max_width: filter by image width
     * - min_height, max_height: filter by image height
     * - sort: created_at|file_size|access_count|file_name (default: created_at)
     * - order: asc|desc (default: desc)
     * - type: image|video (optional)
     */
    public function listFiles() {
        $category = $_GET['category'] ?? 'thumbnail';
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
        $search = $_GET['search'] ?? '';
        $offset = ($page - 1) * $limit;
        
        // Advanced filters
        $dateFrom = $_GET['date_from'] ?? null;
        $dateTo = $_GET['date_to'] ?? null;
        $minSize = isset($_GET['min_size']) ? (int)$_GET['min_size'] : null;
        $maxSize = isset($_GET['max_size']) ? (int)$_GET['max_size'] : null;
        $minWidth = isset($_GET['min_width']) ? (int)$_GET['min_width'] : null;
        $maxWidth = isset($_GET['max_width']) ? (int)$_GET['max_width'] : null;
        $minHeight = isset($_GET['min_height']) ? (int)$_GET['min_height'] : null;
        $maxHeight = isset($_GET['max_height']) ? (int)$_GET['max_height'] : null;
        $minUsage = isset($_GET['min_usage']) ? (int)$_GET['min_usage'] : null;
        $maxUsage = isset($_GET['max_usage']) ? (int)$_GET['max_usage'] : null;
        $typeFilter = $_GET['type'] ?? null;
        
        // Sort options
        $validSorts = ['created_at', 'file_size', 'access_count', 'file_name'];
        $sort = in_array($_GET['sort'] ?? '', $validSorts) ? $_GET['sort'] : 'created_at';
        $order = strtoupper($_GET['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        
        // Validate category
        $validCategories = ['thumbnail', 'lesson', 'resource', 'profile', 'other', 'all'];
        if (!in_array($category, $validCategories)) {
            Response::error('Invalid category', 400);
            return;
        }
        
        try {
            // Build WHERE clause
            $where = [];
            $params = [];
            
            if ($category !== 'all') {
                $where[] = "media_category = ?";
                $params[] = $category;
            } else {
                $where[] = "1=1";
            }
            
            if ($typeFilter === 'video') {
                $where[] = "(file_type LIKE 'video/%' OR file_name LIKE '%.mp4' OR file_name LIKE '%.mov')";
            } elseif ($typeFilter === 'image') {
                $where[] = "(file_type LIKE 'image/%' OR file_name LIKE '%.jpg' OR file_name LIKE '%.jpeg' OR file_name LIKE '%.png' OR file_name LIKE '%.webp' OR file_name LIKE '%.gif')";
            }
            
            // Fuzzy search
            if ($search) {
                $where[] = "file_name LIKE ?";
                $params[] = "%$search%";
            }
            
            // Date range filter
            if ($dateFrom) {
                $where[] = "DATE(created_at) >= ?";
                $params[] = $dateFrom;
            }
            if ($dateTo) {
                $where[] = "DATE(created_at) <= ?";
                $params[] = $dateTo;
            }
            
            // File size filter
            if ($minSize !== null) {
                $where[] = "file_size >= ?";
                $params[] = $minSize;
            }
            if ($maxSize !== null) {
                $where[] = "file_size <= ?";
                $params[] = $maxSize;
            }
            
            // Dimension filters
            if ($minWidth !== null) {
                $where[] = "width >= ?";
                $params[] = $minWidth;
            }
            if ($maxWidth !== null) {
                $where[] = "width <= ?";
                $params[] = $maxWidth;
            }
            if ($minHeight !== null) {
                $where[] = "height >= ?";
                $params[] = $minHeight;
            }
            if ($maxHeight !== null) {
                $where[] = "height <= ?";
                $params[] = $maxHeight;
            }
            
            // Usage count filter
            if ($minUsage !== null) {
                $where[] = "access_count >= ?";
                $params[] = $minUsage;
            }
            if ($maxUsage !== null) {
                $where[] = "access_count <= ?";
                $params[] = $maxUsage;
            }
            
            $whereClause = implode(' AND ', $where);
            
            // Count total files
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM media_files WHERE $whereClause");
            $stmt->execute($params);
            $total = (int)$stmt->fetchColumn();
            
            // Get files with pagination and sorting
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, 
                    file_path, 
                    file_name, 
                    file_type, 
                    file_size, 
                    width, 
                    height, 
                    created_at, 
                    access_count,
                    last_accessed
                FROM media_files 
                WHERE $whereClause
                ORDER BY $sort $order
                LIMIT $limit OFFSET $offset
            ");
            
            $stmt->execute($params);
            $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Enhance file data
            foreach ($files as &$file) {
                // Add preview URL based on category
                if ($category === 'thumbnail') {
                    $file['preview_url'] = '/api/v1/lms/thumbnail/' . $file['file_name'];
                }
                
                // Format file size
                $file['size_formatted'] = $this->formatBytes($file['file_size']);
                
                // Format dates
                $file['created_at_formatted'] = date('d/m/Y H:i', strtotime($file['created_at']));
                if ($file['last_accessed']) {
                    $file['last_accessed_formatted'] = date('d/m/Y H:i', strtotime($file['last_accessed']));
                }
            }
            
            Response::json([
                'success' => true,
                'files' => $files,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ],
                'filters_applied' => [
                    'search' => $search,
                    'date_range' => $dateFrom || $dateTo,
                    'size_range' => $minSize !== null || $maxSize !== null,
                    'dimensions' => $minWidth !== null || $maxWidth !== null || $minHeight !== null || $maxHeight !== null,
                    'usage' => $minUsage !== null || $maxUsage !== null,
                    'type' => $typeFilter
                ],
                'sort' => [
                    'field' => $sort,
                    'order' => $order
                ]
            ]);
            
        } catch (PDOException $e) {
            error_log('MediaController::listFiles error: ' . $e->getMessage());
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * POST /admin/media/track-usage
     * Track usage of a media file (increment access count)
     * 
     * Body:
     * {
     *   "file_path": "thumbnails/thumb_123.png"
     * }
     */
    public function trackUsage() {
        $input = json_decode(file_get_contents('php://input'), true);
        $filePath = $input['file_path'] ?? '';
        
        if (!$filePath) {
            Response::error('file_path is required', 400);
            return;
        }
        
        try {
            $stmt = $this->pdo->prepare("
                UPDATE media_files 
                SET 
                    access_count = access_count + 1,
                    last_accessed = NOW()
                WHERE file_path = ?
            ");
            
            $stmt->execute([$filePath]);
            
            if ($stmt->rowCount() === 0) {
                Response::error('File not found in database', 404);
                return;
            }
            
            Response::json([
                'success' => true,
                'message' => 'Usage tracked successfully'
            ]);
            
        } catch (PDOException $e) {
            error_log('MediaController::trackUsage error: ' . $e->getMessage());
            Response::error('Database error', 500);
        }
    }
    
    /**
     * DELETE /admin/media/batch-delete
     * Delete multiple media files
     * 
     * Body:
     * {
     *   "file_ids": [1, 2, 3]
     * }
     */
    public function batchDelete() {
        $input = json_decode(file_get_contents('php://input'), true);
        $fileIds = $input['file_ids'] ?? [];
        
        if (empty($fileIds) || !is_array($fileIds)) {
            Response::error('file_ids array is required', 400);
            return;
        }
        
        // Validate all IDs are integers
        $fileIds = array_filter($fileIds, 'is_numeric');
        if (empty($fileIds)) {
            Response::error('Invalid file IDs', 400);
            return;
        }
        
        try {
            // Get file paths before deletion (for physical file cleanup)
            $placeholders = implode(',', array_fill(0, count($fileIds), '?'));
            $stmt = $this->pdo->prepare("
                SELECT id, file_path 
                FROM media_files 
                WHERE id IN ($placeholders)
            ");
            $stmt->execute($fileIds);
            $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($files)) {
                Response::error('No files found with provided IDs', 404);
                return;
            }
            
            // Delete from database
            $stmt = $this->pdo->prepare("
                DELETE FROM media_files 
                WHERE id IN ($placeholders)
            ");
            $stmt->execute($fileIds);
            $deletedCount = $stmt->rowCount();
            
            // Delete physical files
            $physicalDeleted = 0;
            $basePath = PRIVATE_UPLOADS_DIR . '/';
            
            foreach ($files as $file) {
                $fullPath = $basePath . $file['file_path'];
                if (file_exists($fullPath) && unlink($fullPath)) {
                    $physicalDeleted++;
                }
            }
            
            Response::json([
                'success' => true,
                'deleted_count' => $deletedCount,
                'physical_files_deleted' => $physicalDeleted,
                'message' => "$deletedCount file(s) deleted from database, $physicalDeleted physical file(s) removed"
            ]);
            
        } catch (PDOException $e) {
            error_log('MediaController::batchDelete error: ' . $e->getMessage());
            Response::error('Database error', 500);
        }
    }
    
    /**
     * PUT /admin/media/update/:id
     * Update file metadata (rename, etc)
     * 
     * Body:
     * {
     *   "file_name": "new_name.png"
     * }
     */
    public function updateFile($id) {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid file ID', 400);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $newFileName = $input['file_name'] ?? '';
        
        if (!$newFileName) {
            Response::error('file_name is required', 400);
            return;
        }
        
        // Validate filename (no path traversal)
        if (strpos($newFileName, '/') !== false || strpos($newFileName, '\\') !== false) {
            Response::error('Invalid filename: path separators not allowed', 400);
            return;
        }
        
        try {
            // Get current file info
            $stmt = $this->pdo->prepare("
                SELECT id, file_path, file_name 
                FROM media_files 
                WHERE id = ?
            ");
            $stmt->execute([$id]);
            $file = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$file) {
                Response::error('File not found', 404);
                return;
            }
            
            // Extract directory from file_path
            $pathParts = explode('/', $file['file_path']);
            $directory = implode('/', array_slice($pathParts, 0, -1));
            $newFilePath = $directory . '/' . $newFileName;
            
            // Check if new filename already exists
            $stmt = $this->pdo->prepare("
                SELECT id FROM media_files 
                WHERE file_path = ? AND id != ?
            ");
            $stmt->execute([$newFilePath, $id]);
            if ($stmt->fetch()) {
                Response::error('A file with this name already exists in the same directory', 409);
                return;
            }
            
            // Rename physical file
            $basePath = PRIVATE_UPLOADS_DIR . '/';
            $oldPath = $basePath . $file['file_path'];
            $newPath = $basePath . $newFilePath;
            
            $physicalRenamed = false;
            if (file_exists($oldPath)) {
                $physicalRenamed = rename($oldPath, $newPath);
            }
            
            // Update database
            $stmt = $this->pdo->prepare("
                UPDATE media_files 
                SET file_name = ?, file_path = ?
                WHERE id = ?
            ");
            $stmt->execute([$newFileName, $newFilePath, $id]);
            
            Response::json([
                'success' => true,
                'file' => [
                    'id' => $id,
                    'file_name' => $newFileName,
                    'file_path' => $newFilePath
                ],
                'physical_renamed' => $physicalRenamed,
                'message' => 'File updated successfully'
            ]);
            
        } catch (PDOException $e) {
            error_log('MediaController::updateFile error: ' . $e->getMessage());
            Response::error('Database error', 500);
        }
    }
    
    /**
     * Format bytes to human-readable size
     */
    private function formatBytes($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
    /**
     * POST /admin/media/upload
     * Generic file upload for Media Manager
     */
    public function upload() {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            Response::error('No file uploaded or upload error', 400);
            return;
        }

        $file = $_FILES['file'];
        $category = $_POST['category'] ?? 'other'; // thumbnail, lesson, resource, etc.
        
        // Validation
        $allowedCategories = ['thumbnail', 'lesson', 'resource', 'profile', 'other'];
        if (!in_array($category, $allowedCategories)) $category = 'other';

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'mp4', 'mp3'];
        
        if (!in_array($ext, $allowedExts)) {
            Response::error('File type not allowed', 400);
            return;
        }

        // Generate Path
        $baseDir = PRIVATE_UPLOADS_DIR;
        $targetDir = $baseDir . '/' . $category . 's/'; // Pluralize: thumbnails, lessons, resources
        
        // Handle specific folder names mismatch if any
        if ($category === 'thumbnail') $targetDir = $baseDir . '/thumbnails/';
        if ($category === 'profile') $targetDir = $baseDir . '/profiles/';
        
        if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

        // Sanitize name
        $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
        $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '', $originalName);
        $fileName = $cleanName . '_' . time() . '.' . $ext;
        $targetPath = $targetDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            try {
                // Register in DB
                $relPath = ($category === 'thumbnail' ? 'thumbnails' : $category . 's') . '/' . $fileName;
                if ($category === 'profile') $relPath = 'profiles/' . $fileName;

                $size = filesize($targetPath);
                $dims = getimagesize($targetPath);
                $width = $dims ? $dims[0] : null;
                $height = $dims ? $dims[1] : null;

                $stmt = $this->pdo->prepare("
                    INSERT INTO media_files (file_path, file_name, file_type, file_size, media_category, width, height, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                $stmt->execute([
                    $relPath,
                    $fileName,
                    $file['type'],
                    $size,
                    $category,
                    $width,
                    $height
                ]);
                $id = $this->pdo->lastInsertId();

                Response::json([
                    'success' => true,
                    'message' => 'Upload successful',
                    'file' => [
                        'id' => $id,
                        'file_path' => $relPath,
                        'file_name' => $fileName,
                        'category' => $category
                    ]
                ]);
            } catch (PDOException $e) {
                // If DB fails, remove file to prevent orphans? Or keep it?
                // unlink($targetPath); 
                Response::error('Database error: ' . $e->getMessage(), 500);
            }
        } else {
            Response::error('Failed to move uploaded file', 500);
        }
    }

    /**
     * POST /admin/media/sync
     * Sync physical files to database
     */
    public function sync() {
        require_once __DIR__ . '/../Services/MediaSyncService.php';
        $service = new MediaSyncService($this->pdo);
        
        try {
            // Default to 'all' categories
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $category = $input['category'] ?? 'all';
            $dryRun = $input['dry_run'] ?? false;
            $prune = $input['prune'] ?? false;
            
            $stats = $service->syncFiles($category, $dryRun, $prune);
            
            Response::json([
                'success' => true,
                'stats' => $stats
            ]);
        } catch (Exception $e) {
            error_log('MediaController::sync error: ' . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }
}
