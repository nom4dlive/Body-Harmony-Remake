<?php
$files = [
    'diagnose_uploads.php',
    'find_videos.php',
    'fix_orphaned_video.php',
    'ls_root.php',
    'diagnose_surgical.php',
    'diagnose_params.php',
    'test_link.php',
    'test_stream_direct.php',
    'cleanup_diagnose.php'
];

foreach ($files as $f) {
    if (file_exists(__DIR__ . '/' . $f)) {
        unlink(__DIR__ . '/' . $f);
        echo "Deleted $f\n";
    }
}
