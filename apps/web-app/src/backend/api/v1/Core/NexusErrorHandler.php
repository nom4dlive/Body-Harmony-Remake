<?php
// api/v1/Core/NexusErrorHandler.php

class NexusErrorHandler
{
    const ERR_VALIDATION_ERROR = 'VALIDATION_ERROR';
    const ERR_UNAUTHORIZED = 'UNAUTHORIZED_ACCESS';
    const ERR_DATABASE_ERROR = 'DATABASE_ERROR';
    const ERR_INTERNAL_ERROR = 'INTERNAL_SERVER_ERROR';

    public static function respond($status, $code, $message, $details = [])
    {
        $response = [
            'success' => false,
            'error_code' => $code,
            'message' => $message
        ];

        if (!empty($details)) {
            $response['details'] = $details;
        }

        require_once __DIR__ . '/Response.php';
        Response::json($response, $status);
        exit;
    }

    public static function validateInput($rawInput)
    {
        $input = json_decode($rawInput, true);
        if ($input === null) {
            self::respond(400, self::ERR_VALIDATION_ERROR, 'Invalid JSON input');
        }
        return $input;
    }

    public static function requireParam($input, $param, $label = null)
    {
        if (!isset($input[$param]) || (is_string($input[$param]) && trim($input[$param]) === '')) {
            $label = $label ?: $param;
            self::respond(400, self::ERR_VALIDATION_ERROR, "Missing required parameter: $label");
        }
        return $input[$param];
    }

    public static function validateAction($action, $allowedActions)
    {
        if (!in_array($action, $allowedActions)) {
            self::respond(400, self::ERR_VALIDATION_ERROR, "Invalid action: $action");
        }
    }
}
