<?php
/**
 * cache_warmup.php — Stability Shield V100
 * Cron/CLI script to pre-load and warm up public cache endpoints.
 */

// 1. Config & Bootstrap
require_once __DIR__ . '/../config.php';

// Register autoloader (same as index.php)
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/Core/' . $class . '.php',
        __DIR__ . '/Controllers/' . $class . '.php',
        __DIR__ . '/Services/' . $class . '.php',
        __DIR__ . '/libs/' . $class . '.php',
        __DIR__ . '/Core/NexusGuard.php',
        __DIR__ . '/../../' . $class . '.php'
    ];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

require_once __DIR__ . '/Core/ResponseCache.php';

// Prevent HTML formatting in CLI
if (php_sapi_name() === 'cli') {
    ini_set('html_errors', 0);
}

echo "=== Stability Shield V100: Cache Warmup Initialized ===\n";
echo "Timestamp: " . date('c') . "\n\n";

$targets = [
    [
        'key' => 'api_results_list',
        'ttl' => 900,
        'fetcher' => fn() => (new ResultController())->getData(),
        'description' => 'Results List'
    ],
    [
        'key' => 'public_faq',
        'ttl' => 900,
        'fetcher' => fn() => (new FaqController())->getData(),
        'description' => 'FAQ'
    ],
    [
        'key' => 'public_licenciadas',
        'ttl' => 900,
        'fetcher' => fn() => (new LicenciadasController())->getData(),
        'description' => 'Licenciadas'
    ],
    [
        'key' => 'public_site_config',
        'ttl' => 900,
        'fetcher' => fn() => (new SiteConfigController())->getData(),
        'description' => 'Site Config'
    ],
    [
        'key' => 'public_mentors',
        'ttl' => 900,
        'fetcher' => fn() => (new ContentController())->getMentorsData(),
        'description' => 'Mentors'
    ],
    [
        'key' => 'public_testimonials',
        'ttl' => 900,
        'fetcher' => fn() => (new ContentController())->getTestimonialsData(),
        'description' => 'Testimonials'
    ],
    [
        'key' => 'public_gallery',
        'ttl' => 900,
        'fetcher' => fn() => (new ContentController())->getGalleryData(),
        'description' => 'Gallery'
    ]
];

$successCount = 0;
$failCount = 0;

foreach ($targets as $target) {
    echo "Warming [{$target['description']}] (key: {$target['key']})... ";
    try {
        // Fetch data using the controller method
        $data = ($target['fetcher'])();
        if (is_array($data)) {
            // Write to cache using ResponseCache
            ResponseCache::write($target['key'], $data, $target['ttl'], true);
            echo "SUCCESS\n";
            $successCount++;
        } else {
            echo "FAILED (Fetcher returned non-array result)\n";
            $failCount++;
        }
    } catch (Throwable $e) {
        // If DB fails, we DO NOT write/overwrite anything. Stale cache is preserved.
        echo "FAILED (Database/Connection failure: " . $e->getMessage() . ")\n";
        $failCount++;
        error_log("[STABILITY][WARMUP] Failed warming {$target['key']}: " . $e->getMessage());
    }
}

echo "\nSummary: {$successCount} warmed, {$failCount} failed.\n";
echo "=== Cache Warmup Finished ===\n";
