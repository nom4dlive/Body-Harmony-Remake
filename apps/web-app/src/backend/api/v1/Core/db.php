<?php
// api/v1/Core/db.php

require_once __DIR__ . '/../../config.php';

if (!function_exists('getDbConnection')) {
    function getDbConnection()
    {
        global $pdo;
        return $pdo;
    }
}
