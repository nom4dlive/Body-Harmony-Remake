<?php
// api/v1/Core/Router.php

class Router {
    private $routes = [];

    public function add($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $this->convertPattern($path),
            'handler' => $handler
        ];
    }

    public function dispatch($method, $uri) {
        // Strip query string and base path
        $uri = parse_url($uri, PHP_URL_PATH);
        // Normalize: strip /api/v1 prefix
        $basePath = '/api/v1';
        if (strpos($uri, $basePath) === 0) {
            $uri = substr($uri, strlen($basePath));
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            // Debug match (Disabled for Production Performance)
            // file_put_contents(__DIR__ . '/../../../logs/router_debug.log', "Testing pattern: {$route['pattern']} against URI: $uri\n", FILE_APPEND);

            $matched = preg_match($route['pattern'], $uri, $matches);
            // file_put_contents(__DIR__ . '/../../../logs/router_debug.log', "Result: " . ($matched ? "MATCHED" : "NO MATCH") . "\n", FILE_APPEND);

            if ($matched) {
                array_shift($matches); // Remove full match
                $handler = $route['handler'];
                
                // Extract controller and action
                // Extract controller and action
                if (is_callable($handler)) {
                    call_user_func_array($handler, $matches);
                } else if (is_string($handler) && strpos($handler, '@') !== false) {
                    [$controllerName, $action] = explode('@', $handler);
                    
                    // 🛡️ Robust Loading: Explicitly require the file if not autoloaded
                    if (!class_exists($controllerName)) {
                        $controllerFile = __DIR__ . '/../Controllers/' . $controllerName . '.php';
                        if (file_exists($controllerFile)) {
                            require_once $controllerFile;
                        } else {
                            // Fallback for libs or other locations if needed, or log error
                            error_log("Router Error: Controller file not found: $controllerFile");
                        }
                    }

                    $controller = new $controllerName();
                    call_user_func_array([$controller, $action], $matches);
                } else if (is_array($handler)) {
                    [$controllerName, $action] = $handler;
                    $controller = new $controllerName();
                    call_user_func_array([$controller, $action], $matches);
                }
                return;
            }
        }

        Response::error('Not Found', 404);
    }

    private function convertPattern($path) {
        // First convert specific {id} to numeric regex for better matching
        $path = str_replace('{id}', '([0-9]+)', $path);
        // Then convert other placeholders
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([a-zA-Z0-9_.\/%-]+)', $path);
        return "#^" . $pattern . "/?$#";
    }
}
