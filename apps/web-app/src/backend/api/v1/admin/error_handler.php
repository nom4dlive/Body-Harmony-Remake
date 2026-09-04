<?php
// api/v1/admin/error_handler.php
// Centralized error response handler for Nexus APIs

class NexusErrorHandler
{
    // Error type constants
    const ERR_EMPTY_BODY = 'EMPTY_REQUEST_BODY';
    const ERR_INVALID_JSON = 'INVALID_JSON';
    const ERR_MISSING_ACTION = 'MISSING_ACTION';
    const ERR_INVALID_ACTION = 'INVALID_ACTION';
    const ERR_MISSING_PARAM = 'MISSING_PARAMETER';
    const ERR_UNAUTHORIZED = 'UNAUTHORIZED';
    const ERR_FORBIDDEN = 'FORBIDDEN';
    const ERR_NOT_FOUND = 'NOT_FOUND';
    const ERR_DATABASE = 'DATABASE_ERROR';
    const ERR_DATABASE_ERROR = 'DATABASE_ERROR'; // Alias
    const ERR_VALIDATION = 'VALIDATION_ERROR';
    const ERR_VALIDATION_ERROR = 'VALIDATION_ERROR'; // Alias

    /**
     * Send standardized error response and exit
     */
    public static function respond($code, $errorType, $message, $details = [])
    {
        http_response_code($code);

        $response = [
            'success' => false,
            'error' => [
                'type' => $errorType,
                'message' => $message,
                'code' => $code
            ]
        ];

        if (!empty($details)) {
            $response['error']['details'] = $details;
        }

        // Log error for debugging
        $detailsStr = !empty($details) ? json_encode($details) : 'none';
        error_log("[NEXUS ERROR] {$errorType}: {$message} | Details: {$detailsStr}");

        echo json_encode($response);
        exit;
    }

    /**
     * Validate and decode JSON input
     * Returns decoded array or exits with error
     */
    public static function validateInput($rawInput)
    {
        if (empty($rawInput)) {
            self::respond(400, self::ERR_EMPTY_BODY,
                'Request body is empty. Make sure you are sending JSON data.',
            ['hint' => 'Check Content-Type header and request payload']
            );
        }

        $decoded = json_decode($rawInput, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            self::respond(400, self::ERR_INVALID_JSON,
                'Invalid JSON format in request body.',
            [
                'json_error' => json_last_error_msg(),
                'hint' => 'Verify JSON syntax is correct'
            ]
            );
        }

        return $decoded;
    }

    /**
     * Require and return action parameter
     */
    public static function requireAction($input)
    {
        if (!isset($input['action']) || empty($input['action'])) {
            self::respond(400, self::ERR_MISSING_ACTION,
                'Action parameter is required but was not provided.',
            [
                'received' => $input,
                'hint' => 'Include "action" field in request body'
            ]
            );
        }

        return $input['action'];
    }

    /**
     * Require and return a specific parameter
     */
    public static function requireParam($input, $param, $friendlyName = null)
    {
        $name = $friendlyName ?? $param;

        if (!isset($input[$param])) {
            self::respond(400, self::ERR_MISSING_PARAM,
                "Required parameter '{$name}' is missing.",
            [
                'parameter' => $param,
                'hint' => "Include '{$param}' in request body"
            ]
            );
        }

        // Allow empty strings for some fields, but not null/undefined
        return $input[$param];
    }

    /**
     * Validate action against allowed list
     */
    public static function validateAction($action, $allowedActions)
    {
        if (!in_array($action, $allowedActions)) {
            self::respond(400, self::ERR_INVALID_ACTION,
                "Unknown action '{$action}'. Valid actions: " . implode(', ', $allowedActions),
            [
                'received_action' => $action,
                'valid_actions' => $allowedActions
            ]
            );
        }
    }
}
