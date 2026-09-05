<?php
// api/v1/index.php — V75.2 Hotfix (ResponseCache Closure Fix)

// 1. Config & Headers
require_once __DIR__ . '/../config.php'; // DB Connection ($pdo)

// Suppress HTML errors in API routes to prevent SyntaxError in frontend
ini_set('display_errors', 0);
error_reporting(E_ALL);
ob_start();

// CORS (Nexus Protocol - Cross-Domain Support)
if (!headers_sent()) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    if (in_array($origin, ['https://bodyharmony.com.br', 'https://www.bodyharmony.com.br'])) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Device-Token, X-DEVICE-ID, X-SCREEN-RESOLUTION, X-ALUNA-TOKEN, X-BOT-API-KEY, x-device-id, x-screen-resolution, x-device-token, x-aluna-token, x-bot-api-key");
    header("Content-Type: application/json; charset=utf-8");
}

// Intercept OPTIONS requests for CORS Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/Core/' . $class . '.php',
        __DIR__ . '/Controllers/' . $class . '.php',
        __DIR__ . '/Services/' . $class . '.php',
        __DIR__ . '/libs/' . $class . '.php',
        __DIR__ . '/Core/NexusGuard.php', // Explicit load for new class if autoload fails
        __DIR__ . '/../../' . $class . '.php' // For shared utils if any
    ];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

// 3. Router Setup
$router = new Router();
$middleware = new AuthMiddleware($pdo);

// ResponseCache — evita conexões DB desnecessárias para dados públicos estáticos
require_once __DIR__ . '/Core/ResponseCache.php';


// --- ROUTES ---

// Health Check (No Auth)
$router->add('GET', '/ping', function () {
    Response::json(['status' => 'ok', 'timestamp' => time()]);
});

// Database Health Check (V98 - PLAN-002)
$router->add('GET', '/ping/db', function () use ($pdo) {
    $node = 'unknown';
    try {
        $node = $pdo->getActiveNode();
    } catch (Exception $e) {
        $node = 'ERROR: ' . $e->getMessage();
    }

    // Measure active database latency
    $dbMs = null;
    try {
        $t = microtime(true);
        $pdo->query("SELECT 1");
        $dbMs = round((microtime(true) - $t) * 1000, 1);
    } catch (Exception $e) {
        $dbMs = -1;
    }

    Response::json([
        'status' => 'ok',
        'active_node' => $node,
        'latency_ms' => [
            'database' => $dbMs,
        ],
        'timestamp' => time(),
    ]);
});

// === AUTH ROUTES ===
$router->add('POST', '/auth/validate-token', function () {
    require_once __DIR__ . '/auth/validate-token.php';
});
$router->add('GET', '/auth/validate-token', function () {
    require_once __DIR__ . '/auth/validate-token.php';
});

$router->add('GET', '/auth/magic/{token}', function ($token) use ($pdo) {
    $service = new MagicTokenService($pdo);
    $licenciadaId = $service->validateAndUse($token);
    
    if ($licenciadaId) {
        $stmt = $pdo->prepare("SELECT * FROM licenciadas WHERE id = ? LIMIT 1");
        $stmt->execute([$licenciadaId]);
        $licenciada = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($licenciada) {
            $deviceToken = bin2hex(random_bytes(32));
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'MagicLink';
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            
            $stmtDev = $pdo->prepare("
                INSERT INTO licenciada_devices (licenciada_id, device_token, user_agent, ip_address, is_active, last_used_at)
                VALUES (?, ?, ?, ?, 1, NOW())
            ");
            $stmtDev->execute([$licenciadaId, $deviceToken, $userAgent, $ip]);
            
            // Redireciona para o portal. O Frontend deve ser capaz de capturar esse token se passado.
            $siteUrl = defined('SITE_URL') ? SITE_URL : 'https://bodyharmony.com.br';
            header("Location: " . $siteUrl . "/portal?token=" . $deviceToken);
            exit();
        }
    }
    
    $siteUrl = defined('SITE_URL') ? SITE_URL : 'https://bodyharmony.com.br';
    header("Location: " . $siteUrl . "/login?error=magic_invalid");
    exit();
});

// === TELEGRAM BOT WEBHOOK ROUTE (PLAN-032) ===
$router->add('POST', '/bot/webhook', function () {
    (new TelegramWebhookController())->handle();
});

// === ASAAS PAYMENT WEBHOOK ROUTES (PLAN-230) ===
$router->add('POST', '/payments/webhook/asaas', function () {
    (new AsaasWebhookController())->handle();
});
$router->add('GET', '/payments/webhook/asaas', function () {
    (new AsaasWebhookController())->handlePing();
});
$router->add('POST', '/payments/webhook/asaas/', function () {
    (new AsaasWebhookController())->handle();
});
$router->add('GET', '/payments/webhook/asaas/', function () {
    (new AsaasWebhookController())->handlePing();
});
$router->add('POST', '/payments/asaas/webhook', function () {
    (new AsaasWebhookController())->handle();
});
$router->add('GET', '/payments/asaas/webhook', function () {
    (new AsaasWebhookController())->handlePing();
});

// === LMS ROUTES ===
$router->add('GET', '/lms/modules', function () use ($middleware) {
    $middleware->handle(); // Enforce Auth
    $controller = new LmsController();
    $controller->index();
});

$router->add('GET', '/lms/modules/{id}/lessons', function ($id) use ($middleware) {
    $middleware->handle(); // Enforce Auth
    $controller = new LmsController();
    $controller->lessons($id);
});

$router->add('GET', '/lms/resources', function () use ($middleware) {
    $middleware->handle();
    $controller = new LmsController();
    $controller->resources();
});

$router->add('POST', '/lms/auto-thumbnail', function () use ($middleware) {
    $middleware->handle();
    $controller = new LmsController();
    $controller->saveAutoThumbnail();
});

// Thumbnail serving (no auth - public thumbnails)
$router->add('GET', '/lms/thumbnail/{filename}', function ($filename) {
    $controller = new LmsController();
    $controller->serveThumbnail($filename);
});

$router->add('PATCH', '/lms/lessons/{id}/duration', function ($id) use ($middleware) {
    $middleware->handle();
    $controller = new LmsController();
    $controller->updateDuration($id);
});

$router->add('PATCH', '/lms/lessons/{id}/thumbnail', function ($id) use ($middleware) {
    $middleware->handle();
    $controller = new LmsController();
    $controller->updateThumbnail($id);
});

$router->add('POST', '/lms/progress', function () use ($middleware) {
    $middleware->handle();
    $controller = new LmsController();
    $controller->saveProgress();
});

$router->add('POST', '/lms/sign-url', function () use ($middleware) {
    $middleware->handle();
    $controller = new LmsController();
    $controller->signUrl();
});

// === LMS STUDENT QUIZ ROUTES (V128) ===
$router->add('GET', '/lms/quiz', function () use ($middleware) {
    $middleware->handle();
    $moduleId = $_GET['module_id'] ?? null;
    if (!$moduleId) Response::error('Missing module_id', 400);
    (new QuizController())->getStudentQuiz($moduleId);
});

$router->add('POST', '/lms/quiz/submit', function () use ($middleware) {
    $middleware->handle();
    (new QuizController())->submitQuiz();
});

// === LMS STUDENT CERTIFICATE ROUTES (PLAN-032 / PLAN-105) ===
$router->add('GET', '/lms/certificates/status', function () use ($middleware) {
    $middleware->handle();
    (new CertificateController())->licenciadaStatus();
});

$router->add('GET', '/lms/certificates/master/download', function () use ($middleware) {
    $middleware->handle();
    (new CertificateController())->downloadMaster();
});

$router->add('GET', '/lms/modules/{moduleId}/certificate', function ($moduleId) use ($middleware) {
    $middleware->handle();
    (new CertificateController())->show($moduleId);
});

$router->add('GET', '/lms/modules/{moduleId}/certificate/download', function ($moduleId) use ($middleware) {
    $middleware->handle();
    (new CertificateController())->download($moduleId);
});

// === GESTOR LMS CERTIFICATE TEMPLATE GOVERNANCE ===
$router->add('GET', '/admin/lms/certificate-template', function () use ($middleware) {
    $middleware->handle('admin');
    (new CertificateController())->getTemplate();
});

$router->add('PUT', '/admin/lms/certificate-template', function () use ($middleware) {
    $middleware->handle('admin');
    (new CertificateController())->updateTemplate();
});

$router->add('GET', '/admin/lms/certificate-preview', function () use ($middleware) {
    $middleware->handle('admin');
    (new CertificateController())->preview();
});

// === PUBLIC CERTIFICATE AUTHENTICITY VALIDATION (QR Code / URL) ===
$router->add('GET', '/certificates/verify/{hash}', function ($hash) {
    (new CertificateController())->verifyPublic($hash);
});
$router->add('GET', '/public/certificates/verify/{hash}', function ($hash) {
    (new CertificateController())->verifyPublic($hash);
});

// === CONTRACT DOWNLOAD ROUTES (PLAN-045) ===
$router->add('GET', '/contracts/download', function () {
    require __DIR__ . '/contracts/download.php';
});
$router->add('GET', '/contracts/download.php', function () {
    require __DIR__ . '/contracts/download.php';
});

// === ADMIN CONTRACTS ROUTES (PLAN-036 / PLAN-100) ===
$router->add('GET', '/admin/contracts/templates.php', function () {
    require __DIR__ . '/admin/contracts/templates.php';
});
$router->add('GET', '/admin/contracts/templates', function () {
    require __DIR__ . '/admin/contracts/templates.php';
});
$router->add('POST', '/admin/contracts/templates.php', function () {
    require __DIR__ . '/admin/contracts/templates.php';
});
$router->add('POST', '/admin/contracts/templates', function () {
    require __DIR__ . '/admin/contracts/templates.php';
});
$router->add('GET', '/admin/contracts/index.php', function () {
    require __DIR__ . '/admin/contracts/index.php';
});
$router->add('GET', '/admin/contracts', function () {
    require __DIR__ . '/admin/contracts/index.php';
});
$router->add('POST', '/admin/contracts/index.php', function () {
    require __DIR__ . '/admin/contracts/index.php';
});
$router->add('POST', '/admin/contracts', function () {
    require __DIR__ . '/admin/contracts/index.php';
});
$router->add('DELETE', '/admin/contracts/index.php', function () {
    require __DIR__ . '/admin/contracts/index.php';
});
$router->add('DELETE', '/admin/contracts', function () {
    require __DIR__ . '/admin/contracts/index.php';
});
$router->add('POST', '/admin/contracts/upload_signed.php', function () {
    require __DIR__ . '/admin/contracts/upload_signed.php';
});
$router->add('POST', '/admin/contracts/upload_signed', function () {
    require __DIR__ . '/admin/contracts/upload_signed.php';
});
$router->add('POST', '/admin/contracts/upload-signed', function () {
    require __DIR__ . '/admin/contracts/upload_signed.php';
});


// === LICENCIADA ROUTES (Portal) ===
$router->add('GET', '/licenciada/progress', function () use ($middleware) {
    $middleware->handle();
    require __DIR__ . '/licenciada/progress.php';
});

$router->add('GET', '/licenciada/dashboard-summary', function () use ($middleware) {
    $middleware->handle();
    require __DIR__ . '/licenciada/dashboard_summary.php';
});

// Alias for backward compatibility
$router->add('GET', '/student/progress', function () use ($middleware) {
    $middleware->handle();
    require __DIR__ . '/licenciada/progress.php';
});

// === LMS MANAGEMENT (Admin Only) ===
$router->add('GET', '/admin/lms/dashboard', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->dashboard();
});
$router->add('GET', '/admin/lms/modules', function () use ($middleware) {
    $middleware->handle('admin');
    global $loggedUser;
    $cacheKey = "admin_lms_modules_" . ($loggedUser['id'] ?? 0);
    ResponseCache::serve($cacheKey, fn() => (new AdminLmsController())->indexData(), 300, false);
});
$router->add('POST', '/admin/lms/modules', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->createModule();
});
$router->add('PUT', '/admin/lms/modules', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->updateModule();
});
$router->add('DELETE', '/admin/lms/modules/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->deleteModule($id);
});
$router->add('PATCH', '/admin/lms/modules/reorder', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->reorderModules();
});
$router->add('PATCH', '/admin/lms/lessons/reorder', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->reorderLessons();
});

$router->add('POST', '/admin/lms/lessons', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->createLesson();
});
$router->add('PUT', '/admin/lms/lessons', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->updateLesson();
});
$router->add('DELETE', '/admin/lms/lessons/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->deleteLesson($id); });
$router->add('PATCH', '/admin/lms/modules/{id}/status', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->updateModuleStatus($id); });
$router->add('PATCH', '/admin/lms/lessons/{id}/status', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->updateLessonStatus($id); });
$router->add('POST', '/admin/lms/lessons/{id}/retranscribe', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->retranscribeLesson($id); });


// === LMS ADMIN QUIZ ROUTES (V128) ===
$router->add('GET', '/admin/lms/quiz', function () use ($middleware) {
    $middleware->handle('admin');
    $moduleId = $_GET['module_id'] ?? null;
    if (!$moduleId) Response::error('Missing module_id', 400);
    (new QuizController())->getAdminQuiz($moduleId);
});

$router->add('POST', '/admin/lms/quiz', function () use ($middleware) {
    $middleware->handle('admin');
    (new QuizController())->saveQuiz();
});


$router->add('GET', '/admin/lms/lessons/{id}/file-info', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->fileInfo($id);
});
$router->add('GET', '/admin/lms/lessons/{id}/download-url', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->getDownloadUrl($id);
});

$router->add('POST', '/admin/lms/upload-chunk', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->uploadVideoChunk();
});
$router->add('POST', '/admin/lms/upload-thumbnail', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->uploadThumbnail();
});
$router->add('POST', '/admin/lms/attachments', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->uploadAttachment();
});
$router->add('DELETE', '/admin/lms/attachments/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->deleteAttachment($id);
});
$router->add('POST', '/admin/lms/sign-url', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->signUrl();
});

// === MEDIA BROWSER ROUTES (Admin Only) ===
$router->add('GET', '/admin/media/list', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new MediaController();
    $controller->listFiles();
});

$router->add('POST', '/admin/media/track-usage', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new MediaController();
    $controller->trackUsage();
});

$router->add('DELETE', '/admin/media/batch-delete', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new MediaController();
    $controller->batchDelete();
});

$router->add('PUT', '/admin/media/update/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    $controller = new MediaController();
    $controller->updateFile($id);
});

$router->add('POST', '/admin/media/upload', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new MediaController();
    $controller->upload();
});

$router->add('POST', '/admin/media/sync', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new MediaController();
    $controller->sync();
});


// === NEXUS SCRIPTS ROUTES (Admin Only) ===
$router->add('POST', '/admin/nexus/forensics/analyze', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusForensicsController())->analyze();
});

$router->add('GET', '/admin/nexus/forensics/logs', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusForensicsController())->getRecentLogs();
});

$router->add('GET', '/admin/nexus/forensics/lookup/{hash}', function ($hash) use ($middleware) {
    $middleware->handle('admin');
    (new NexusForensicsController())->lookupHash($hash);
});

$router->add('GET', '/admin/nexus/forensics/licenciadas', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusForensicsController())->listStudents();
});

$router->add('POST', '/admin/nexus/forensics/generate-batch', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusForensicsController())->generateBatch();
});

$router->add('GET', '/admin/nexus/forensics/config', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusForensicsController())->getDefaultConfig();
});

$router->add('POST', '/admin/nexus/forensics/config', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusForensicsController())->updateDefaultConfig();
});

$router->add('GET', '/nexus/scripts/list', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new NexusScriptsController();
    $controller->listScripts();
});

$router->add('POST', '/nexus/scripts/execute', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new NexusScriptsController();
    $controller->executeScript();
});

$router->add('GET', '/nexus/scripts/history', function () use ($middleware) {
    $middleware->handle('admin');
    $controller = new NexusScriptsController();
    $controller->getHistory();
});

// === GESTOR LMS ROUTES ===
$router->add('GET', '/gestor/lms/licenciadas', function () use ($middleware) {
    $middleware->handle('admin');
    global $loggedUser;
    $cacheKey = "gestor_licenciadas_list_" . ($loggedUser['id'] ?? 0);
    ResponseCache::serve($cacheKey, fn() => (new AdminLmsController())->studentsData(), 300, false);
});

// Alias: frontend usa /gestor/lms/students (legacy naming) 
$router->add('GET', '/gestor/lms/students', function () use ($middleware) {
    $middleware->handle('admin');
    global $loggedUser;
    $cacheKey = "gestor_licenciadas_list_" . ($loggedUser['id'] ?? 0);
    ResponseCache::serve($cacheKey, fn() => (new AdminLmsController())->studentsData(), 300, false);
});

$router->add('GET', '/gestor/lms/students/{id}/logs', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->studentLogs($id);
});

// === EXCLUSIVE ACCESS MANAGEMENT (Admin Only) ===
$router->add('GET', '/admin/lms/exclusive-access/list', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->listExclusiveAccess();
});
$router->add('GET', '/admin/lms/exclusive-access/targets', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->listExclusiveAccessTargets();
});
$router->add('POST', '/admin/lms/exclusive-access/grant', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->grantExclusiveAccess();
});
$router->add('POST', '/admin/lms/exclusive-access/revoke', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->revokeExclusiveAccess();
});

// === HLS BATCH CONVERSION (Admin Only) ===
$router->add('POST', '/admin/lms/lessons/convert-hls-batch', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->convertHlsBatch();
});
$router->add('GET', '/admin/lms/lessons/convert-hls-batch-status', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->convertHlsBatchStatus();
});

// === THUMBNAILS BATCH GENERATION (Admin Only) ===
$router->add('POST', '/admin/lms/lessons/generate-thumbnails-batch', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->generateThumbnailsBatch();
});
$router->add('GET', '/admin/lms/lessons/generate-thumbnails-batch-status', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminLmsController())->generateThumbnailsBatchStatus();
});



// === LIBRARY ROUTES (ADMIN) ===
$router->add('GET', '/admin/library', function () use ($middleware) {
    $middleware->handle('admin');
    (new LibraryController())->index();
});

$router->add('POST', '/admin/library', function () use ($middleware) {
    $middleware->handle('admin');
    (new LibraryController())->store();
});

$router->add('DELETE', '/admin/library/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new LibraryController())->delete($id);
});

$router->add('PATCH', '/admin/library/{id}/approve', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new LibraryController())->approve($id);
});

$router->add('PATCH', '/admin/library/{id}/reject', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new LibraryController())->reject($id);
});

$router->add('POST', '/admin/library/{id}/grant', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new LibraryController())->grantAccess($id);
});

// === GESTOR AGENDA ROUTES (PLAN-062) ===
$router->add('GET', '/admin/agenda/events', function () use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->listEvents();
});

$router->add('POST', '/admin/agenda/events', function () use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->createEvent();
});

$router->add('PUT', '/admin/agenda/events/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->updateEvent($id);
});

$router->add('PATCH', '/admin/agenda/events/{id}/status', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->updateStatus($id);
});

$router->add('DELETE', '/admin/agenda/events/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->deleteEvent($id);
});

$router->add('GET', '/admin/agenda/summary', function () use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->getSummaryStats();
});

// === GESTOR AGENDA ADVANCED ROUTES (PLAN-063) ===
$router->add('GET', '/admin/agenda/feed.ics', function () {
    (new GestorAgendaController())->getFeedIcal();
});

$router->add('GET', '/admin/agenda/events/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->getEventDetail($id);
});

$router->add('GET', '/admin/agenda/events/{id}/comments', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->getComments($id);
});

$router->add('POST', '/admin/agenda/events/{id}/comments', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->addComment($id);
});

$router->add('POST', '/admin/agenda/events/{id}/attachments', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->uploadAttachment($id);
});

$router->add('POST', '/admin/agenda/events/{id}/checklists', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->addChecklist($id);
});

$router->add('PATCH', '/admin/agenda/checklists/{id}/toggle', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->toggleChecklist($id);
});

// Shares de Agenda (PLAN-063)
$router->add('GET', '/admin/agenda/shares', function () use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->listShares();
});

$router->add('POST', '/admin/agenda/shares', function () use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->share();
});

$router->add('DELETE', '/admin/agenda/shares', function () use ($middleware) {
    $middleware->handle('admin');
    (new GestorAgendaController())->revokeShare();
});

// === LICENCIADA ONBOARDING FUNNEL ROUTES (PLAN-064) ===

// 1. Public Onboarding Routes (No Auth)
$router->add('GET', '/public/onboarding/{token}', function ($token) {
    (new OnboardingController())->getPublicTokenInfo($token);
});

$router->add('POST', '/public/onboarding/{token}', function ($token) {
    (new OnboardingController())->submitPublicOnboarding($token);
});

$router->add('POST', '/public/onboarding/submit', function () {
    (new OnboardingController())->submitPublicOnboarding();
});

$router->add('POST', '/public/onboarding/ocr', function () {
    (new OnboardingController())->processOcrDocument();
});

// 2. Admin Onboarding Funnel Routes (Admin Auth)

// PLAN-066: Métricas agregadas do funil (deve vir ANTES da rota genérica /{id})
$router->add('GET', '/admin/onboarding/metrics', function () use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->getMetrics();
});

$router->add('POST', '/admin/onboarding/tokens', function () use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->generateToken();
});

$router->add('POST', '/admin/onboarding/links', function () use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->generateToken();
});

$router->add('GET', '/admin/onboarding/funnel', function () use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->listFunnel();
});

$router->add('GET', '/admin/onboarding/requests/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->getRequestDetail($id);
});

$router->add('GET', '/admin/onboarding/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->getRequestDetail($id);
});

$router->add('POST', '/admin/onboarding/requests/{id}/generate-contract', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->generateContract1Click($id);
});

$router->add('POST', '/admin/onboarding/{id}/generate-contract', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->generateContract1Click($id);
});

$router->add('POST', '/admin/onboarding/requests/{id}/whatsapp-reminder', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->sendWhatsAppReminder($id);
});

$router->add('POST', '/admin/onboarding/{id}/whatsapp-reminder', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->sendWhatsAppReminder($id);
});

$router->add('POST', '/admin/onboarding/requests/{id}/confirm-payment', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->confirmPaymentAndActivate($id);
});

$router->add('POST', '/admin/onboarding/{id}/confirm-payment', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->confirmPaymentAndActivate($id);
});

$router->add('PATCH', '/admin/onboarding/requests/{id}/status', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->updateStatus($id);
});

$router->add('PATCH', '/admin/onboarding/{id}/status', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->updateStatus($id);
});

// PLAN-067: Download ZIP e Aprovação com Integração de Licenciada
$router->add('GET', '/admin/onboarding/requests/{id}/download-zip', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->downloadZip($id);
});

$router->add('GET', '/admin/onboarding/{id}/download-zip', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->downloadZip($id);
});

// Streaming seguro e autenticado de documentos de onboarding
$router->add('GET', '/admin/onboarding/requests/{id}/document/{type}', function ($id, $type) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->serveDocument($id, $type);
});

$router->add('GET', '/admin/onboarding/{id}/document/{type}', function ($id, $type) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->serveDocument($id, $type);
});

$router->add('POST', '/admin/onboarding/requests/{id}/approve-and-integrate', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->approveAndIntegrate($id);
});

$router->add('POST', '/admin/onboarding/{id}/approve-and-integrate', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->approveAndIntegrate($id);
});


$router->add('PATCH', '/admin/onboarding/{id}/status', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->updateStatus($id);
});

// Sandbox & Governança de Onboardings (PLAN-083)
$router->add('DELETE', '/admin/onboarding/requests/{identifier}', function ($identifier) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->deleteRequest($identifier);
});

$router->add('DELETE', '/admin/onboarding/{identifier}', function ($identifier) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->deleteRequest($identifier);
});

$router->add('POST', '/admin/onboarding/sandbox/generate-quick', function () use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->generateQuickMock();
});

$router->add('POST', '/admin/onboarding/sandbox/purge-tests', function () use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->purgeTestRequests();
});

$router->add('PATCH', '/admin/onboarding/requests/{id}/assign', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->assignRequest($id);
});

$router->add('PATCH', '/admin/onboarding/{id}/assign', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new OnboardingController())->assignRequest($id);
});



// === RESULTS ROUTES ===
$router->add('GET', '/results', function () {
    // Cache por 5 minutos (Público)
    ResponseCache::serve('api_results_list', function () {
        return (new ResultController())->getData();
    }, 300, true);
});

$router->add('POST', '/results', function () use ($middleware) {
    if (method_exists($middleware, 'handle'))
        $middleware->handle();
    ResponseCache::invalidate('api_results_list', true);
    (new ResultController())->store();
});

$router->add('PUT', '/results/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle'))
        $middleware->handle();
    ResponseCache::invalidate('api_results_list', true);
    (new ResultController())->update($id);
});

$router->add('DELETE', '/results/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle'))
        $middleware->handle();
    ResponseCache::invalidate('api_results_list', true);
    (new ResultController())->destroy($id);
});

// === FAQ ROUTES ===
$router->add('GET', '/faq', function () {
    ResponseCache::serve('public_faq', fn() => (new FaqController())->getData(), 300, true);
});

$router->add('POST', '/faq', function () use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_faq', true);
    (new FaqController())->store();
});

$router->add('PUT', '/faq/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_faq', true);
    (new FaqController())->update($id);
});

$router->add('DELETE', '/faq/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_faq', true);
    (new FaqController())->destroy($id);
});

// === LICENCIADA ROUTES ===
$router->add('GET', '/licenciadas', function () {
    ResponseCache::serve('public_licenciadas', fn() => (new LicenciadasController())->getData(), 300, true);
});

$router->add('GET', '/licenciadas/{id}', function ($id) {
    $controller = new LicenciadasController();
    $controller->show($id);
});

$router->add('POST', '/licenciadas', function () use ($middleware) {
    $middleware->handle(); // Auth Required
    ResponseCache::invalidate('public_licenciadas', true);
    $controller = new LicenciadasController();
    $controller->store();
});

$router->add('PUT', '/licenciadas/{id}', function ($id) use ($middleware) {
    $middleware->handle(); // Auth Required
    ResponseCache::invalidate('public_licenciadas', true);
    $controller = new LicenciadasController();
    $controller->update($id);
});

$router->add('DELETE', '/licenciadas/{id}', function ($id) use ($middleware) {
    $middleware->handle(); // Auth Required
    ResponseCache::invalidate('public_licenciadas', true);
    $controller = new LicenciadasController();
    $controller->destroy($id);
});

// === DEVICE MANAGEMENT (Admin) ===
$router->add('GET', '/admin/licenciadas/{id}/devices', function ($id) use ($middleware) {
    $middleware->handle('admin');
    $controller = new LicenciadasController();
    $controller->getDevices($id);
});

$router->add('DELETE', '/admin/licenciadas/devices/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    $controller = new LicenciadasController();
    $controller->removeDevice($id);
});

$router->add('DELETE', '/admin/licenciadas/{id}/revoke-devices', function ($id) use ($middleware) {
    $middleware->handle('admin');
    $controller = new LicenciadasController();
    $controller->revokeDevices($id);
});

// === AUTH ROUTES ===
$router->add('POST', '/auth/login', function () {
    $controller = new AuthController();
    $controller->login();
});

$router->add('POST', '/auth/licenciada/login', function () {
    $controller = new AuthController();
    $controller->loginLicenciada();
});

$router->add('GET', '/auth/licenciada/validate', function () {
    // Stability Shield V100: Proteger contra DB down
    try {
        $controller = new AuthController();
        $controller->validateLicenciadaSession();
    } catch (PDOException $e) {
        error_log('[STABILITY] Auth validate DB failure: ' . $e->getMessage());
        if (!headers_sent()) {
            http_response_code(503);
            header('Retry-After: 30');
        }
        echo json_encode(['error' => 'Service temporarily unavailable', 'code' => 'DB_UNAVAILABLE', 'retry_after' => 30]);
        exit;
    }
});

$router->add('PUT', '/auth/licenciada/profile', function () use ($middleware) {
    $middleware->handle('licenciada');
    (new LicenciadasController())->updateProfile();
});
$router->add('POST', '/auth/licenciada/change_password', function () {
    $controller = new AuthController();
    $controller->changePasswordLicenciada();
});

$router->add('POST', '/auth/licenciada/first-access', function () {
    $controller = new AuthController();
    $controller->changePasswordFirstAccess();
});

// Aliases
$router->add('POST', '/auth/student/change_password', function () {
    (new AuthController())->changePasswordLicenciada();
});
$router->add('POST', '/auth/student/first-access', function () {
    (new AuthController())->changePasswordFirstAccess();
});

$router->add('POST', '/auth/admin/change_password', function () {
    $controller = new AuthController();
    $controller->changePasswordAdmin();
});

// =========================================================
// === PORTAL ALUNA INDIVIDUAL (V68) =======================
// =========================================================

// Auth Aluna — rotas públicas (sem guard de admin/licenciada)
$router->add('POST', '/auth/aluna/login', function () {
    (new AlunaAuthController())->login();
});
$router->add('GET', '/auth/aluna/validate', function () {
    (new AlunaAuthController())->validate();
});
$router->add('POST', '/auth/aluna/change_password', function () {
    (new AlunaAuthController())->changePassword();
});
$router->add('POST', '/auth/aluna/first-access', function () {
    (new AlunaAuthController())->firstAccess();
});

// LMS Aluna — guard próprio (token al_*)
$router->add('GET', '/aluna/modules', function () use ($pdo) {
    AlunaLmsController::guardAluna($pdo);
    (new AlunaLmsController())->modules();
});
$router->add('GET', '/aluna/catalog', function () use ($pdo) {
    AlunaLmsController::guardAluna($pdo);
    (new AlunaLmsController())->catalog();
});
$router->add('GET', '/aluna/modules/{id}/lessons', function ($id) use ($pdo) {
    AlunaLmsController::guardAluna($pdo);
    (new AlunaLmsController())->lessons($id);
});
$router->add('POST', '/aluna/progress', function () use ($pdo) {
    AlunaLmsController::guardAluna($pdo);
    (new AlunaLmsController())->saveProgress();
});
$router->add('POST', '/aluna/sign-url', function () use ($pdo) {
    AlunaLmsController::guardAluna($pdo);
    (new AlunaLmsController())->signUrl();
});
$router->add('GET', '/aluna/certificate/{module_id}', function ($moduleId) use ($pdo) {
    AlunaLmsController::guardAluna($pdo);
    (new AlunaLmsController())->certificate($moduleId);
});
$router->add('GET', '/aluna/pending-terms', function () use ($pdo) {
    AlunaLmsController::guardAluna($pdo);
    (new AlunaLmsController())->pendingTerms();
});

// Admin — Gestão de Alunas (Admin only)
$router->add('GET', '/admin/alunas', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->index();
});
$router->add('GET', '/admin/alunas/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->show($id);
});
$router->add('POST', '/admin/alunas', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->store();
});
$router->add('POST', '/admin/alunas/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->update($id);
});
$router->add('DELETE', '/admin/alunas/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->destroy($id);
});
$router->add('POST', '/admin/alunas/{id}/grant-access', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->grantAccess($id);
});
$router->add('DELETE', '/admin/alunas/{id}/revoke-access/{module_id}', function ($id, $moduleId) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->revokeAccess($id, $moduleId);
});
$router->add('POST', '/admin/alunas/{id}/reset-password', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->resetPassword($id);
});
$router->add('POST', '/admin/licenciadas/{id}/reset-password', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new LicenciadasController())->resetPassword($id);
});


$router->add('GET', '/admin/alunas/{id}/accesses', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->accesses($id);
});
$router->add('POST', '/admin/alunas/{id}/revoke-devices', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->revokeDevices($id);
});
$router->add('DELETE', '/admin/alunas/{id}/permanent', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->hardDelete($id);
});
$router->add('POST', '/admin/alunas/{id}/unlock', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->unlock($id);
});
$router->add('GET', '/admin/alunas/{id}/devices', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->devices($id);
});



// =========================================================

// === BARRACKS — USER MANAGEMENT (Admin) ===
$router->add('GET', '/admin/users', function () use ($middleware) {
    $middleware->handle('admin');
    (new BarracksController())->getUsers();
});

$router->add('POST', '/admin/users', function () use ($middleware) {
    $middleware->handle('admin');
    (new BarracksController())->manageUser();
});

$router->add('POST', '/admin/users/check-access', function () use ($middleware) {
    $middleware->handle('admin');
    (new BarracksController())->checkAccess();
});

$router->add('GET', '/admin/admins', function () use ($middleware) {
    $middleware->handle('admin');
    (new BarracksController())->getAdmins();
});

$router->add('POST', '/admin/admins', function () use ($middleware) {
    $middleware->handle('admin');
    (new BarracksController())->manageAdmin();
});

// === SESSION INSPECTOR (Admin) ===
$router->add('GET', '/admin/sessions', function () use ($middleware) {
    $middleware->handle('admin');
    (new SessionController())->getSessions();
});

$router->add('POST', '/admin/sessions/terminate', function () use ($middleware) {
    $middleware->handle('admin');
    (new SessionController())->terminateSession();
});

// === WATCHTOWER FORENSIC TIMELINE ===
$router->add('GET', '/admin/nexus/watchtower/timeline', function () use ($middleware) {
    $middleware->handle('admin');
    (new WatchtowerController())->getForensicTimeline();
});

// === NEXUS OPS MAINTENANCE ===
$router->add('POST', '/admin/nexus/ops/maintenance', function () use ($middleware) {
    (new NexusOpsController())->systemMaintenance($middleware->handle('admin'));
});

// === CONSOLIDATED PUBLIC LANDING DATA (Nexus V122) ===
$router->add('GET', '/public/landing-data', function () {
    ResponseCache::serve('api_public_landing_data', function () {
        // Carrega classes de forma robusta
        if (!class_exists('SiteConfigController')) require_once __DIR__ . '/Controllers/SiteConfigController.php';
        if (!class_exists('LicenciadasController')) require_once __DIR__ . '/Controllers/LicenciadasController.php';
        if (!class_exists('ResultController')) require_once __DIR__ . '/Controllers/ResultController.php';
        if (!class_exists('ContentController')) require_once __DIR__ . '/Controllers/ContentController.php';
        if (!class_exists('FaqController')) require_once __DIR__ . '/Controllers/FaqController.php';

        return [
            'config' => (new SiteConfigController())->getData(),
            'licenciadas' => (new LicenciadasController())->getData(),
            'results' => (new ResultController())->getData(),
            'testimonials' => (new ContentController())->getTestimonialsData(),
            'faq' => (new FaqController())->getData(),
            'mentors' => (new ContentController())->getMentorsData(),
        ];
    }, 1800, true); // Cache de 30 minutos (Público)
});

// === SITE CONFIG ===
$router->add('GET', '/site_config', function () {
    ResponseCache::serve('public_site_config', fn() => (new SiteConfigController())->getData(), 300, true);
});

$router->add('POST', '/admin/site_config', function () use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_site_config', true);
    (new SiteConfigController())->update();
});

$router->add('GET', '/admin/site_config/history', function () use ($middleware) {
    $middleware->handle('admin');
    (new SiteConfigController())->getHistory();
});

$router->add('POST', '/admin/site_config/rollback', function () use ($middleware) {
    $middleware->handle('admin');
    ResponseCache::invalidate('public_site_config', true);
    (new SiteConfigController())->rollback();
});

// === CONTENT (Mentors, Testimonials, Gallery) ===
$router->add('GET', '/mentors', function () {
    ResponseCache::serve('public_mentors', fn() => (new ContentController())->getMentorsData(), 300, true);
});

$router->add('POST', '/admin/mentors', function () use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_mentors', true);
    (new ContentController())->storeMentor();
});

$router->add('PUT', '/admin/mentors/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_mentors', true);
    (new ContentController())->updateMentor($id);
});

$router->add('DELETE', '/admin/mentors/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_mentors');
    (new ContentController())->deleteMentor($id);
});

$router->add('GET', '/testimonials', function () {
    ResponseCache::serve('public_testimonials', fn() => (new ContentController())->getTestimonialsData(), 300, true);
});

$router->add('POST', '/admin/testimonials', function () use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_testimonials', true);
    (new ContentController())->storeTestimonial();
});

$router->add('DELETE', '/admin/testimonials/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_testimonials', true);
    (new ContentController())->deleteTestimonial($id);
});

$router->add('GET', '/gallery', function () {
    ResponseCache::serve('public_gallery', fn() => (new ContentController())->getGalleryData(), 300, true);
});

$router->add('PUT', '/admin/gallery/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_gallery', true);
    (new ContentController())->updateGallery($id);
});

$router->add('DELETE', '/admin/gallery/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    ResponseCache::invalidate('public_gallery');
    (new ContentController())->deleteGallery($id);
});

// === LEADS ===
$router->add('GET', '/admin/leads', function () use ($middleware) {
    $middleware->handle();
    $controller = new LeadController();
    $controller->index();
});

$router->add('POST', '/leads', function () {
    $controller = new LeadController();
    $controller->store();
});

$router->add('PUT', '/admin/leads/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    $controller = new LeadController();
    $controller->update($id);
});

$router->add('DELETE', '/admin/leads/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    $controller = new LeadController();
    $controller->destroy($id);
});



// === ANALYTICS ROUTES (NEXUS) ===
$router->add('GET', '/admin/analytics/watchtower', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    // Cache 5 min — endpoint custoso (multi-query). Evita max_connections_per_hour.
    ResponseCache::serve('admin_watchtower_stats', function () {
        (new AnalyticsController())->watchtower();
    }, 300, false);
});

$router->add('GET', '/admin/analytics/war-room', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    ResponseCache::serve('admin_war_room_stats', function () {
        (new AnalyticsController())->warRoom();
    }, 300, false);
});

$router->add('GET', '/admin/analytics/stats', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Forbidden', 403);
    $controller = new AnalyticsController();
    $controller->getStats();
});

// V95 — Bot Support Staging Stats
$router->add('GET', '/admin/analytics/bot-stats', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Forbidden', 403);
    ResponseCache::serve('admin_bot_stats', function () {
        (new AnalyticsController())->getBotStats();
    }, 60, false);
});

// === NEXUS OPS / FIREWALL ROUTES ===
$router->add('GET', '/admin/nexus/ops/firewall', function () use ($middleware) {
    $user = $middleware->handle('admin');
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    (new NexusOpsController())->getRules();
});

$router->add('POST', '/admin/nexus/ops/firewall', function () use ($middleware) {
    $user = $middleware->handle('admin');
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    (new NexusOpsController())->addRule($user);
});

$router->add('DELETE', '/admin/nexus/ops/firewall/{id}', function ($id) use ($middleware) {
    $user = $middleware->handle('admin');
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    (new NexusOpsController())->removeRule($id, $user);
});

$router->add('GET', '/admin/nexus/ops/audit-feed', function () use ($middleware) {
    $user = $middleware->handle('admin');
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    (new NexusOpsController())->getAuditFeed();
});

// === BROADCAST ROUTES ===
$router->add('GET', '/broadcasts/active', function () use ($middleware) {
    // Stability Shield V100: Proteger contra DB down
    try {
        $middleware->handle(); // Allows both students and admins
        (new BroadcastController())->getActive();
    } catch (PDOException $e) {
        error_log('[STABILITY] Broadcasts active DB failure: ' . $e->getMessage());
        if (!headers_sent()) {
            http_response_code(503);
            header('Retry-After: 30');
        }
        echo json_encode(['error' => 'Service temporarily unavailable', 'code' => 'DB_UNAVAILABLE', 'retry_after' => 30]);
        exit;
    }
});

$router->add('GET', '/broadcasts/history', function () use ($middleware) {
    $middleware->handle();
    (new BroadcastController())->getHistory();
});

$router->add('POST', '/broadcasts/acknowledge', function () use ($middleware) {
    $middleware->handle(); // Necessary to know WHO is acknowledging
    (new BroadcastController())->acknowledge();
});

$router->add('GET', '/admin/broadcasts', function () use ($middleware) {
    $middleware->handle('admin');
    (new BroadcastController())->index();
});

$router->add('POST', '/admin/broadcasts', function () use ($middleware) {
    $middleware->handle('admin');
    (new BroadcastController())->manage();
});

$router->add('DELETE', '/admin/broadcasts/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new BroadcastController())->delete($id);
});

// === ADMIN ROUTES (NEXUS) ===
$router->add('GET', '/admin/users', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->users();
});

$router->add('POST', '/admin/users', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->manageUser();
});

$router->add('POST', '/admin/users/check-access', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->checkAccessDiagnostic();
});

$router->add('POST', '/admin/impersonate', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->impersonate();
});

$router->add('GET', '/admin/sessions', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new SessionController();
    $controller->getSessions();
});

$router->add('POST', '/admin/sessions/terminate', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new SessionController();
    $controller->terminateSession();
});

$router->add('GET', '/admin/health', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->health();
});

$router->add('GET', '/admin/logs', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->logs();
});

$router->add('POST', '/admin/maintenance', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->toggleMaintenance();
});

$router->add('POST', '/admin/flush-cache', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->flushCache();
});


$router->add('GET', '/admin/admins', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->admins();
});

$router->add('POST', '/admin/admins', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new AdminController();
    $controller->manageAdmin();
});

// === QUIZ ROUTES (ADMIN) ===
$router->add('GET', '/admin/quiz', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Forbidden', 403);
    $moduleId = $_GET['module_id'] ?? 0;
    $controller = new QuizController();
    $controller->getAdminQuiz($moduleId);
});

$router->add('POST', '/admin/quiz', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Forbidden', 403);
    $controller = new QuizController();
    $controller->saveQuiz();
});

// === QUIZ ROUTES (STUDENT) ===
$router->add('GET', '/lms/quiz', function () use ($middleware) {
    $middleware->handle();
    $moduleId = $_GET['module_id'] ?? 0;
    $controller = new QuizController();
    $controller->getStudentQuiz($moduleId);
});

$router->add('POST', '/lms/quiz/submit', function () use ($middleware) {
    $middleware->handle();
    $controller = new QuizController();
    $controller->submitQuiz();
});

// === NUDGE SYSTEM ===
$router->add('POST', '/admin/nudge', function () use ($middleware) {
    $middleware->handle('admin');
    // Using existing legacy file logic for now as it contains complex business logic
    //Ideally this should be refactored into a NudgeController
    chdir(__DIR__ . '/admin'); // Adjust CWD for includes inside nudge.php
    require __DIR__ . '/admin/nudge.php';
});

// === CERTIFICATE ROUTES ===
$router->add('POST', '/lms/certificate/generate', function () use ($middleware) {
    $user = $middleware->handle();
    $controller = new CertificateController();
    $controller->generate($user);
});

// Authenticated Route Example (Placeholder)
$router->add('GET', '/me', function () use ($middleware) {
    $user = $middleware->handle();
    Response::json(['user' => $user]);
});

// === SESSION MANAGEMENT ROUTES (NEXUS) ===
$router->add('GET', '/admin/sessions', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new SessionController();
    $controller->getSessions();
});

$router->add('POST', '/admin/sessions/terminate', function () use ($middleware) {
    $user = $middleware->handle();
    if (!$user['is_admin'])
        Response::error('Unauthorized Nexus Access', 403);
    $controller = new SessionController();
    (new SessionController())->terminateSession();
});

// === DATABASE MANAGEMENT ROUTES ===
$router->add('GET', '/admin/db/status', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->getStatus();
});
$router->add('GET', '/admin/db/migrations', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->listMigrations();
});
$router->add('POST', '/admin/db/migrations/run', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->runMigration();
});
$router->add('GET', '/admin/db/seeds', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->listSeeds();
});
$router->add('POST', '/admin/db/seeds/run', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->runSeed();
});
$router->add('GET', '/admin/db/scripts', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->listScripts();
});
$router->add('POST', '/admin/db/export', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->exportSnapshot();
});

$router->add('POST', '/admin/db/export', function () use ($middleware) {
    $middleware->handle();
    (new DatabaseController())->exportSnapshot();
});

// === NEXUS TESTING HUB ROUTES ===
$router->add('GET', '/admin/nexus/tests/suites', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusTestController())->suites();
});
$router->add('POST', '/admin/nexus/tests/run', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusTestController())->run();
});
$router->add('GET', '/admin/nexus/tests/status', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusTestController())->status();
});

// === Nexus Database Governance Routes ===
$router->add('GET', '/admin/nexus/db/status', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->status();
});
$router->add('POST', '/admin/nexus/db/rebuild', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->rebuild();
});
$router->add('GET', '/admin/nexus/db/migrations', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->migrations();
});
$router->add('POST', '/admin/nexus/db/migrations/run', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->runMigration();
});
$router->add('GET', '/admin/nexus/db/seeds', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->seeds();
});
$router->add('POST', '/admin/nexus/db/seeds/run', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->runSeed();
});
$router->add('GET', '/admin/nexus/db/scripts', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->scripts();
});
$router->add('POST', '/admin/nexus/db/export', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->export();
});
$router->add('GET', '/admin/nexus/db/exports', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->listExports();
});
$router->add('GET', '/admin/nexus/db/download', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->downloadExport();
});
$router->add('POST', '/admin/nexus/db/switch', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->switchNode();
});
$router->add('POST', '/admin/nexus/db/heal', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->heal();
});
$router->add('POST', '/admin/nexus/db/sync', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->sync();
});
$router->add('POST', '/admin/nexus/db/upload', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->uploadMigration();
});
$router->add('GET', '/admin/nexus/db/licenciadas/export', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->exportLicenciadas();
});
$router->add('POST', '/admin/nexus/db/licenciadas/import', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDbController())->importLicenciadas();
});

// === LICENCIADAS MANAGEMENT (Admin) ===
$router->add('GET', '/admin/licenciadas/export', function () use ($middleware) {
    $middleware->handle('admin');
    (new LicenciadasController())->export();
});
$router->add('POST', '/admin/licenciadas', function () use ($middleware) {
    $middleware->handle('admin');
    ResponseCache::invalidate('public_licenciadas', true);
    (new LicenciadasController())->store();
});
$router->add('POST', '/admin/licenciadas/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    ResponseCache::invalidate('public_licenciadas', true);
    (new LicenciadasController())->update($id);
});

// === LICENCIADA 360º DOSSIER & CROSS-MODULE SYNC (PLAN-142) ===
$router->add('GET', '/admin/licenciadas/{id}/dossier', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    if (!class_exists('Licenciada360Controller')) require_once __DIR__ . '/Controllers/Licenciada360Controller.php';
    (new Licenciada360Controller())->getDossier($id);
});

$router->add('PUT', '/admin/licenciadas/{id}/dossier', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    if (!class_exists('Licenciada360Controller')) require_once __DIR__ . '/Controllers/Licenciada360Controller.php';
    (new Licenciada360Controller())->updateDossier($id);
});

$router->add('POST', '/admin/licenciadas/sync-360', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    if (!class_exists('Licenciada360Controller')) require_once __DIR__ . '/Controllers/Licenciada360Controller.php';
    (new Licenciada360Controller())->sync360();
});

$router->add('GET', '/admin/licenciadas/view-360', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    if (!class_exists('Licenciada360Controller')) require_once __DIR__ . '/Controllers/Licenciada360Controller.php';
    (new Licenciada360Controller())->getView360();
});

// === NEXUS DASHBOARD (War Room) ===
$router->add('GET', '/admin/nexus/system-status', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDashboardController())->getSystemStatus();
});

$router->add('GET', '/admin/nexus/security-metrics', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusDashboardController())->getSecurityMetrics();
});

// === NEXUS OPS (Superadmin) ===
$router->add('GET', '/nexus/ops/rules', function () use ($middleware) {
    // $middleware->handle('superadmin'); // TODO: Implement specific superadmin check
    $middleware->handle('admin');
    (new NexusOpsController($GLOBALS['pdo']))->getRules();
});

$router->add('POST', '/nexus/ops/rules', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusOpsController($GLOBALS['pdo']))->updateRules();
});

$router->add('GET', '/nexus/ops/audit', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusOpsController($GLOBALS['pdo']))->getAuditLogs();
});

$router->add('POST', '/nexus/ops/trust-device', function () use ($pdo) {
    (new NexusGuard($pdo))->handle();
    $controller = new NexusOpsController($pdo);
    $controller->trustDevice();
});

$router->add('POST', '/nexus/ops/ip-rules', function () use ($middleware) {
    $middleware->handle('admin');
    (new NexusOpsController($GLOBALS['pdo']))->manageIPRule();
});

// === DOCTOR HARMONY CLINICAL CORE (Student + Admin) ===
$router->add('GET', '/doctor-harmony/credits', function () use ($middleware) {
    $middleware->handle();
    $controller = new DoctorHarmonyController();
    $controller->getCredits();
});

$router->add('POST', '/doctor-harmony/evaluate', function () use ($middleware) {
    $middleware->handle('licenciada');
    (new DoctorHarmonyController())->analyze();
});

$router->add('GET', '/doctor-harmony/history', function () use ($middleware) {
    $middleware->handle();
    (new DoctorHarmonyController())->getHistory();
});

$router->add('GET', '/doctor-harmony/context', function () use ($middleware) {
    $middleware->handle();
    (new DoctorHarmonyController())->getContext();
});

$router->add('POST', '/doctor-harmony/log-event', function () use ($middleware) {
    $middleware->handle();
    (new DoctorHarmonyController())->logWidgetEvent();
});

$router->add('GET', '/doctor-harmony/session', function () use ($middleware) {
    $middleware->handle();
    (new DoctorHarmonyController())->getSession();
});

$router->add('POST', '/doctor-harmony/session', function () use ($middleware) {
    $middleware->handle();
    (new DoctorHarmonyController())->saveSession();
});

// Admin Review & Oversight
$router->add('GET', '/admin/doctor-harmony/cases/pending', function () use ($middleware) {
    $middleware->handle('admin');
    (new DoctorHarmonyController())->getPendingCases(); // Logic moved from MentorIA to DoctorHarmony
});

$router->add('POST', '/admin/doctor-harmony/cases/{id}/review', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new DoctorHarmonyController())->submitReview($id);
});

// Admin Config & Logs
$router->add('GET', '/admin/doctor-harmony/config', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminDoctorHarmonyController())->getConfig();
});

$router->add('POST', '/admin/doctor-harmony/config', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminDoctorHarmonyController())->updateConfig();
});

$router->add('GET', '/admin/doctor-harmony/audit', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminDoctorHarmonyController())->getAuditLogs();
});

$router->add('GET', '/admin/doctor-harmony/health', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminDoctorHarmonyController())->healthCheck();
});

$router->add('POST', '/admin/doctor-harmony/sandbox', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminDoctorHarmonyController())->runSandbox();
});


// --- DISPATCH ---

// === DOCTOR HARMONY ROUTES ===
$router->add('GET', '/doctor-harmony/history', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new DoctorHarmonyController())->getHistory();
});

$router->add('GET', '/doctor-harmony/context', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new DoctorHarmonyController())->getContext();
});

$router->add('POST', '/doctor-harmony/evaluate', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new DoctorHarmonyController())->analyze();
});

// === AUTH ROUTES (Aluna Portal) ===
$router->add('POST', '/auth/aluna/login', function () {
    (new AuthController())->loginAluna();
});
$router->add('GET', '/auth/aluna/validate', function () {
    (new AuthController())->validateAlunaSession();
});

// === ADMIN ALUNAS (New Portal Student Management) ===
$router->add('GET', '/admin/alunas', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->index();
});

$router->add('POST', '/admin/alunas', function () use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->store();
});

$router->add('GET', '/admin/alunas/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->show($id);
});

$router->add('PUT', '/admin/alunas/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->update($id);
});

$router->add('DELETE', '/admin/alunas/{id}', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->destroy($id);
});

$router->add('POST', '/admin/alunas/{id}/unlock', function ($id) use ($middleware) {
    $middleware->handle('admin');
    (new AdminAlunaController())->unlock($id);
});

// === SHOP & STONE PAYMENTS ROUTES (PLAN-086) ===
$router->add('GET', '/shop/products', function () {
    (new ShopController())->listProducts();
});

$router->add('GET', '/shop/products/{slug}', function ($slug) {
    (new ShopController())->getProduct($slug);
});

$router->add('POST', '/shop/checkout', function () {
    (new ShopController())->processCheckout();
});

$router->add('POST', '/shop/webhook', function () {
    (new ShopController())->handleWebhook();
});

// === CONGRESS BODY HARMONY & ASAAS GATEWAY ROUTES (PLAN-159) ===
$router->add('GET', '/congress/tiers', function () {
    (new CongressController())->getTiers();
});

$router->add('POST', '/congress/coupons/validate', function () {
    (new CongressController())->validateCoupon();
});

$router->add('POST', '/congress/checkout', function () {
    (new CongressController())->checkout();
});

$router->add('POST', '/congress/ticket/lookup', function () {
    (new CongressController())->lookupTicket();
});

$router->add('GET', '/congress/ticket/{token}', function ($token) {
    (new CongressController())->getTicket($token);
});

$router->add('POST', '/admin/congress/tiers/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new CongressController())->updateTier($id);
});

$router->add('GET', '/admin/congress/coupons', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new CongressController())->listAdminCoupons();
});

$router->add('POST', '/admin/congress/coupons', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new CongressController())->saveAdminCoupon();
});

$router->add('DELETE', '/admin/congress/coupons/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new CongressController())->deleteAdminCoupon($id);
});

$router->add('GET', '/admin/congress/coupons/{id}/usages', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new CongressController())->getCouponUsages($id);
});

$router->add('POST', '/admin/congress/checkin', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new CongressController())->checkIn();
});

$router->add('POST', '/payments/webhook/asaas', function () {
    (new AsaasWebhookController())->handle();
});

$router->add('GET', '/admin/shop/orders', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->listAdminOrders();
});

$router->add('GET', '/admin/shop/leads', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->listAdminLeads();
});

$router->add('POST', '/admin/shop/orders/{id}/validate', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->validateOrder($id);
});

// PLAN-142: Check-in / Credenciamento de Ingressos
$router->add('POST', '/admin/shop/checkin', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->checkinTicket();
});

// PLAN-142: CRUD RBAC de Pedidos
$router->add('PUT', '/admin/shop/orders/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->updateOrder($id);
});

$router->add('DELETE', '/admin/shop/orders/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->deleteOrder($id);
});

// PLAN-142: CRUD RBAC de Leads
$router->add('PUT', '/admin/shop/leads/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->updateLead($id);
});

$router->add('DELETE', '/admin/shop/leads/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->deleteLead($id);
});

// PLAN-142: Checagem Pública de Ingresso (Token Polimórfico - REGRA 15)
$router->add('GET', '/shop/tickets/{token}', function ($token) {
    (new ShopController())->getPublicTicket($token);
});

$router->add('GET', '/admin/shop/products', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->listAdminProducts();
});

$router->add('POST', '/admin/shop/products', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->createAdminProduct();
});

$router->add('PUT', '/admin/shop/products/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->updateAdminProduct($id);
});

$router->add('POST', '/admin/shop/products/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->updateAdminProduct($id);
});

$router->add('DELETE', '/admin/shop/products/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->deleteAdminProduct($id);
});

$router->add('POST', '/admin/shop/products/{id}/toggle-status', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->toggleProductStatus($id);
});

$router->add('GET', '/shop/settings', function () {
    (new ShopController())->getPublicSettings();
});

$router->add('GET', '/admin/shop/settings', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->getAdminSettings();
});

$router->add('POST', '/admin/shop/settings', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->updateAdminSettings();
});

$router->add('POST', '/admin/shop/products/{id}/image', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->uploadProductImage($id);
});

$router->add('POST', '/admin/shop/products/{id}/generate-payment-link', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->generateAsaasPaymentLink($id);
});

// === CONGRESSO GALLERY UPLOAD (PLAN-110) ===
$router->add('POST', '/admin/congresso/gallery/upload', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new ShopController())->uploadCongressoPhoto();
});

// === FINANCIAL MODULE (PLAN-122) ===
require_once __DIR__ . '/Controllers/FinancialDashboardController.php';
require_once __DIR__ . '/Controllers/FinancialCostCenterController.php';
require_once __DIR__ . '/Services/CashCloseService.php';

$router->add('GET', '/admin/financial/dashboard', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialDashboardController())->getDashboard();
});

$router->add('GET', '/admin/financial/transactions', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialDashboardController())->getTransactions();
});

$router->add('POST', '/admin/financial/transactions', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialDashboardController())->createTransaction();
});

$router->add('GET', '/admin/financial/cash-close', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    $date = $_GET['date'] ?? date('Y-m-d');
    $service = new \BodyHarmony\Services\CashCloseService($GLOBALS['pdo'] ?? $GLOBALS['db'] ?? null);
    $data = $service->getDailyClose($date);
    Response::json(['success' => true, 'data' => $data]);
});

$router->add('POST', '/admin/financial/cash-close/{date}', function ($date) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    global $loggedUser;
    $adminId = $loggedUser['id'] ?? 0;
    $service = new \BodyHarmony\Services\CashCloseService($GLOBALS['pdo'] ?? $GLOBALS['db'] ?? null);
    $data = $service->performDailyClose($date, $adminId);
    Response::json(['success' => true, 'data' => $data]);
});

$router->add('GET', '/admin/financial/cost-centers', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialCostCenterController())->list();
});

$router->add('POST', '/admin/financial/cost-centers', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialCostCenterController())->create();
});

$router->add('PUT', '/admin/financial/cost-centers/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialCostCenterController())->update($id);
});

$router->add('POST', '/admin/financial/cost-centers/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialCostCenterController())->update($id);
});

$router->add('DELETE', '/admin/financial/cost-centers/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialCostCenterController())->delete($id);
});

$router->add('GET', '/admin/financial/cost-centers/{id}/expenses', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialCostCenterController())->listExpenses($id);
});

$router->add('GET', '/admin/financial/expenses/categories', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialDashboardController())->getCategories();
});

$router->add('POST', '/admin/financial/expenses', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialDashboardController())->createExpense();
});

$router->add('GET', '/admin/financial/reports/dre-expanded', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialDashboardController())->getDreExpanded();
});

$router->add('GET', '/admin/financial/reports/dre', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new FinancialDashboardController())->getDre();
});

// === LICENSE TAXES & FINANCIAL HUB (PLAN-132 / PLAN-133 / PLAN-139) ===
require_once __DIR__ . '/Controllers/LicenseTaxController.php';

$router->add('GET', '/admin/financial/audit-logs', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->getAuditLogs();
});

$router->add('GET', '/admin/financial/license-taxes/summary', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->getSummary();
});

$router->add('GET', '/admin/financial/license-taxes/export', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->export();
});

$router->add('POST', '/admin/financial/license-taxes/sync-all', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->syncAll();
});

$router->add('POST', '/admin/financial/license-taxes/upload', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->uploadAttachment();
});

$router->add('GET', '/admin/financial/license-taxes', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->list();
});

$router->add('GET', '/admin/financial/license-taxes/{id}/receipt-whatsapp', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->getReceiptWhatsApp($id);
});

$router->add('GET', '/admin/financial/license-taxes/{id}/attachments', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->getAttachments($id);
});

$router->add('GET', '/admin/financial/license-taxes/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->getById($id);
});

$router->add('POST', '/admin/financial/license-taxes', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->create();
});

$router->add('POST', '/admin/financial/license-taxes/seed', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->seedHistorical();
});

$router->add('POST', '/admin/financial/license-taxes/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->update($id);
});

$router->add('PUT', '/admin/financial/license-taxes/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->update($id);
});

$router->add('POST', '/admin/financial/receipt', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->uploadReceipt();
});

$router->add('DELETE', '/admin/financial/license-taxes/attachments/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->deleteAttachment($id);
});

$router->add('DELETE', '/admin/financial/license-taxes/{id}', function ($id) use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LicenseTaxController())->delete($id);
});


$router->add('POST', '/lgpd/consent', function () use ($middleware) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LgpdController())->recordConsent();
});

$router->add('GET', '/lgpd/status', function () use ($middleware) {
    // Stability Shield V100: Proteger contra DB down
    try {
        if (method_exists($middleware, 'handle')) {
            $middleware->handle();
        }
        (new LgpdController())->getStatus();
    } catch (PDOException $e) {
        error_log('[STABILITY] LGPD status DB failure: ' . $e->getMessage());
        if (!headers_sent()) {
            http_response_code(503);
            header('Retry-After: 30');
        }
        echo json_encode(['error' => 'Service temporarily unavailable', 'code' => 'DB_UNAVAILABLE', 'retry_after' => 30]);
        exit;
    }
});

$router->add('GET', '/lgpd/terms', function () {
    (new LgpdController())->getTerms();
});

// === IA NOTEBOOK LMS ROUTES (PLAN-101 / PLAN-102) ===
$router->add('GET', '/admin/lms/notebooks/modules', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->listModules();
});

$router->add('GET', '/admin/lms/notebooks/modules/{id}/sources', function ($id) use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->getModuleSources($id);
});

$router->add('POST', '/admin/lms/notebooks/modules/{id}/sources/pdf', function ($id) use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->uploadPdfSource($id);
});

$router->add('POST', '/admin/lms/notebooks/modules/{id}/sync', function ($id) use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->syncModule($id);
});

$router->add('POST', '/admin/lms/notebooks/sync', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    (new LmsNotebookController($pdo))->syncModules($data);
});

$router->add('GET', '/admin/lms/notebooks/beta-testers', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->listBetaTesters();
});

$router->add('POST', '/admin/lms/notebooks/beta-testers', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    (new LmsNotebookController($pdo))->updateBetaTester($data);
});

$router->add('POST', '/admin/lms/notebooks/impersonate-ticket', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    (new LmsNotebookController($pdo))->getImpersonateTicket($data);
});

$router->add('GET', '/admin/lms/notebooks/governance/settings', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->getGovernanceSettings();
});

$router->add('POST', '/admin/lms/notebooks/governance/settings', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    (new LmsNotebookController($pdo))->updateGovernanceSettings($data);
});

$router->add('GET', '/admin/lms/notebooks/governance/insights', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->getClinicalInsights();
});

$router->add('GET', '/admin/lms/notebooks/governance/podcasts', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->getPodcastsGallery();
});

$router->add('POST', '/admin/lms/notebooks/governance/podcasts/{id}/feature', function ($id) use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle();
    }
    (new LmsNotebookController($pdo))->togglePodcastFeature($id);
});

// === GOOGLE NOTEBOOKLM OAUTH 1-CLIQUE ROUTES ===
$router->add('GET', '/admin/lms/notebook/auth/status', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LmsNotebookController($pdo))->getGoogleAuthStatus();
});
$router->add('GET', '/admin/lms/notebook/auth/google/url', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LmsNotebookController($pdo))->getGoogleAuthUrl();
});
$router->add('GET', '/admin/lms/notebook/auth/google/callback', function () use ($pdo) {
    (new LmsNotebookController($pdo))->handleGoogleCallback();
});
$router->add('POST', '/admin/lms/notebook/auth/disconnect', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LmsNotebookController($pdo))->disconnectGoogle();
});
$router->add('GET', '/admin/lms/notebook/auth/config', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    (new LmsNotebookController($pdo))->getAuthConfig();
});
$router->add('POST', '/admin/lms/notebook/auth/config', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    (new LmsNotebookController($pdo))->saveAuthConfig($data);
});
$router->add('POST', '/admin/lms/notebook/auth/session-token', function () use ($middleware, $pdo) {
    if (method_exists($middleware, 'handle')) {
        $middleware->handle('admin');
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    (new LmsNotebookController($pdo))->saveSessionToken($data);
});

$router->add('POST', '/aluna/notebook/ticket', function () use ($pdo) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $licenciadaId = $_SERVER['HTTP_X_ALUNA_ID'] ?? ($data['licenciada_id'] ?? 0);
    (new LmsNotebookController($pdo))->getAuthTicket($data, $licenciadaId);
});

$router->add('POST', '/aluna/notebook/chat', function () use ($pdo) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $licenciadaId = $_SERVER['HTTP_X_ALUNA_ID'] ?? ($data['licenciada_id'] ?? 0);
    (new LmsNotebookController($pdo))->chatWithNotebook($data, $licenciadaId);
});

$router->add('POST', '/aluna/notebook/podcast/generate', function () use ($pdo) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $licenciadaId = $_SERVER['HTTP_X_ALUNA_ID'] ?? ($data['licenciada_id'] ?? 0);
    (new LmsNotebookController($pdo))->generatePodcast($data, $licenciadaId);
});

$router->add('GET', '/aluna/smartbook/transformations', function () use ($pdo) {
    (new LmsNotebookController($pdo))->getArtifacts();
});

$router->add('POST', '/aluna/smartbook/transformations/execute', function () use ($pdo) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $licenciadaId = $_SERVER['HTTP_X_ALUNA_ID'] ?? ($data['licenciada_id'] ?? 0);
    (new LmsNotebookController($pdo))->executeTransformation($data, $licenciadaId);
});

// === CANONICAL SMARTBOOK ROUTES (NEXUS V3.1 COMPATIBILITY GATEWAY) ===
$router->add('POST', '/smartbook/query', function () {
    Response::json([
        'error' => 'Smart Book AI Engine está hospedado na VPS dedicada de IA',
        'vps_endpoint' => 'https://notebook.bodyharmony.com.br/api/v1/rag/query',
        'action' => 'O frontend React deve direcionar chamadas diretamente para a VPS com Bearer Token'
    ], 503);
});

$router->add('POST', '/smartbook/transformations/execute', function () {
    Response::json([
        'error' => 'Smart Book AI Engine está hospedado na VPS dedicada de IA',
        'vps_endpoint' => 'https://notebook.bodyharmony.com.br/api/v1/transform/execute',
        'action' => 'O frontend React deve direcionar chamadas diretamente para a VPS com Bearer Token'
    ], 503);
});

$router->add('POST', '/smartbook/sync/notebook', function () {
    Response::json([
        'error' => 'Smart Book AI Engine está hospedado na VPS dedicada de IA',
        'vps_endpoint' => 'https://notebook.bodyharmony.com.br/api/v1/notebooks/sync',
        'action' => 'O frontend React deve direcionar chamadas diretamente para a VPS com Bearer Token'
    ], 503);
});

// POST /auth/licenciada/login (LMS / Portal)
$router->add('POST', '/auth/licenciada/login', function () {
    (new AuthController())->loginLicenciada();
});

// Alias for compatibility
$router->add('POST', '/auth/student/login', function () {
    (new AuthController())->loginLicenciada();
});

// Alias for LGPD (Support legacy frontend calls)
$router->add('POST', '/lgpd/consent', function () use ($middleware) {
    if (method_exists($middleware, 'handle'))
        $middleware->handle();
    (new LgpdController())->recordConsent();
});
$router->add('GET', '/lgpd/status', function () use ($middleware) {
    if (method_exists($middleware, 'handle'))
        $middleware->handle();
    (new LgpdController())->getStatus();
});
$router->add('GET', '/lgpd/terms', function () {
    (new LgpdController())->getTerms();
});

// === CRM CENTRALIZADO (PLAN-153 / PLAN-154 / PLAN-155 / PLAN-157) ===
$router->add('POST', '/crm/webhook', function () {
    require_once __DIR__ . '/crm/webhook.php';
});
$router->add('GET', '/crm/dossier', function () {
    require_once __DIR__ . '/crm/dossier.php';
});
$router->add('POST', '/crm/triggers/contract', function () {
    require_once __DIR__ . '/crm/triggers.php';
});
$router->add('POST', '/crm/triggers/mentorship', function () {
    require_once __DIR__ . '/crm/triggers.php';
});
$router->add('POST', '/crm/burner/dispatch', function () {
    require_once __DIR__ . '/crm/burner.php';
});
$router->add('POST', '/crm/burner/campaign', function () {
    require_once __DIR__ . '/crm/burner.php';
});
$router->add('GET', '/crm/seed-team', function () {
    require_once __DIR__ . '/crm/seed_team.php';
});
$router->add('POST', '/crm/seed-team', function () {
    require_once __DIR__ . '/crm/seed_team.php';
});
$router->add('GET', '/crm/status', function () {
    require_once __DIR__ . '/crm/status.php';
});
$router->add('POST', '/crm/instances/{instance}/connect', function ($instance) {
    $_GET['instance'] = $instance;
    require_once __DIR__ . '/crm/instance_connect.php';
});
$router->add('GET', '/crm/instances/{instance}/connect', function ($instance) {
    $_GET['instance'] = $instance;
    require_once __DIR__ . '/crm/instance_connect.php';
});
$router->add('POST', '/crm/instances/{instance}/disconnect', function ($instance) {
    $_GET['instance'] = $instance;
    require_once __DIR__ . '/crm/instance_disconnect.php';
});
$router->add('DELETE', '/crm/instances/{instance}', function ($instance) {
    $_GET['instance'] = $instance;
    require_once __DIR__ . '/crm/instance_disconnect.php';
});
$router->add('PATCH', '/crm/inboxes/{inboxId}', function ($inboxId) use ($middleware) {
    $middleware->requireAuth();
    require_once __DIR__ . '/crm/inbox_update.php';
});
$router->add('PUT', '/crm/inboxes/{inboxId}', function ($inboxId) use ($middleware) {
    $middleware->requireAuth();
    require_once __DIR__ . '/crm/inbox_update.php';
});
$router->add('POST', '/crm/inboxes/{inboxId}', function ($inboxId) use ($middleware) {
    $middleware->requireAuth();
    require_once __DIR__ . '/crm/inbox_update.php';
});
$router->add('POST', '/crm/history/import', function () use ($middleware) {
    $middleware->requireAuth();
    require_once __DIR__ . '/crm/history_import.php';
});
$router->add('GET', '/crm/history/export', function () use ($middleware) {
    $middleware->requireAuth();
    require_once __DIR__ . '/crm/history_export.php';
});
$router->add('GET', '/crm/cockpit/context', function () {
    require_once __DIR__ . '/crm/cockpit/context.php';
});
$router->add('POST', '/crm/cockpit/appointments', function () {
    require_once __DIR__ . '/crm/cockpit/appointment.php';
});
$router->add('GET', '/crm/cockpit/meet', function () {
    require_once __DIR__ . '/crm/cockpit/meet.php';
});
$router->add('POST', '/crm/anti-noshow/process', function () {
    require_once __DIR__ . '/crm/anti_noshow_process.php';
});
$router->add('POST', '/crm/webhooks/anamnese', function () {
    require_once __DIR__ . '/crm/anamnese_webhook.php';
});
$router->add('POST', '/crm/webhooks/media-sync', function () {
    require_once __DIR__ . '/crm/media_sync.php';
});
$router->add('GET', '/crm/kanban/cards', function () {
    require_once __DIR__ . '/crm/kanban_cards.php';
});
$router->add('POST', '/crm/kanban/move', function () {
    require_once __DIR__ . '/crm/kanban_move.php';
});
$router->add('POST', '/crm/noshow/trigger', function () {
    require_once __DIR__ . '/crm/noshow_trigger.php';
});
$router->add('GET', '/crm/noshow/stats', function () {
    require_once __DIR__ . '/crm/noshow_trigger.php';
});
$router->add('POST', '/crm/macros/sync', function () {
    require_once __DIR__ . '/crm/canned_responses.php';
});
$router->add('GET', '/crm/macros', function () {
    require_once __DIR__ . '/crm/canned_responses.php';
});
$router->add('POST', '/crm/google-contacts/sync', function () {
    require_once __DIR__ . '/crm/google_contacts.php';
});
$router->add('GET', '/crm/google-contacts/stats', function () {
    require_once __DIR__ . '/crm/google_contacts.php';
});
$router->add('GET', '/crm/social-channels/status', function () {
    require_once __DIR__ . '/crm/social_channels.php';
});
$router->add('POST', '/crm/social-channels/connect', function () {
    require_once __DIR__ . '/crm/social_channels.php';
});
$router->add('GET', '/crm/afterhours/settings', function () {
    require_once __DIR__ . '/crm/afterhours.php';
});
$router->add('POST', '/crm/afterhours/settings', function () {
    require_once __DIR__ . '/crm/afterhours.php';
});
$router->add('POST', '/crm/afterhours/simulate', function () {
    require_once __DIR__ . '/crm/afterhours.php';
});
$router->add('GET', '/crm/analytics/export', function () {
    require_once __DIR__ . '/crm/analytics_export.php';
});

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Remove query string
if (strpos($uri, '?') !== false) {
    $uri = substr($uri, 0, strpos($uri, '?'));
}

// Cleanup: Remove /api/v1 prefix (STABILITY FIX V100)
$uri = str_replace('/api/v1', '', $uri);
if (empty($uri)) $uri = '/';

try {
    $router->dispatch($method, $uri);
}
catch (Throwable $e) {
    error_log("[ROUTER ERROR] " . $e->getMessage());
    Response::error($e->getMessage() . " (Log: " . bin2hex(random_bytes(4)) . ")", 500);
}
