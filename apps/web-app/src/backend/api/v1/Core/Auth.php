<?php
// api/v1/Core/Auth.php

class Auth
{
    /**
     * Validates student session and returns ID
     */
    public static function validateStudent()
    {
        global $loggedUser;

        // If already validated by middleware
        if (isset($loggedUser) && $loggedUser['id'] > 0) {
            return $loggedUser['id'];
        }

        // Fallback for direct calls
        require_once __DIR__ . '/AuthMiddleware.php';
        require_once __DIR__ . '/../../config.php';
        global $pdo;

        try {
            $middleware = new AuthMiddleware($pdo);
            $user = $middleware->handle('student');
            return $user['id'];
        }
        catch (Exception $e) {
            return false;
        }
    }

    public static function isAdmin()
    {
        global $loggedUser;
        return isset($loggedUser) && !empty($loggedUser['is_admin']);
    }
}
