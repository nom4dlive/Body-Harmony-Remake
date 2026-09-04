<?php
// api/v1/Core/Response.php

class Response
{
    public static function json($data, $status = 200)
    {
        // Clear buffer
        if (ob_get_length())
            ob_clean();

        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error($message, $status = 400, $code = null)
    {
        $response = ['error' => $message];
        if ($code)
            $response['code'] = $code;

        self::json($response, $status);
    }

    /**
     * Legacy send method
     */
    public static function send($status, $data)
    {
        self::json($data, $status);
    }
}
