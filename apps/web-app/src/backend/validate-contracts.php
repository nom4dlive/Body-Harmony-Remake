<?php
/**
 * Script de Validação de Contratos (Nexus V3.1)
 * Verifica a consistência dos arquivos de contrato JSON em openspec/contracts/
 * e valida se os arquivos físicos de compliance mapeados de fato existem.
 */

// Resolvendo a raiz do repositório dinamicamente
$baseDir = dirname(dirname(dirname(dirname(__DIR__))));
if (!file_exists($baseDir . '/openspec')) {
    // Fallback caso seja executado a partir de outra pasta
    $baseDir = realpath(__DIR__ . '/../../../../');
}

$contractsDir = $baseDir . '/openspec/contracts';

echo "🔍 Iniciando validação de contratos em: $contractsDir\n";
echo "Root do repositório resolvido: $baseDir\n\n";

if (!is_dir($contractsDir)) {
    echo "❌ Erro: Diretório de contratos não encontrado.\n";
    exit(1);
}

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($contractsDir));
$errors = [];
$validatedCount = 0;

foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'json') {
        $validatedCount++;
        $filePath = $file->getPathname();
        $relativePath = str_replace($baseDir . DIRECTORY_SEPARATOR, '', $filePath);
        echo "📄 Analisando: $relativePath... ";

        $content = file_get_contents($filePath);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "❌ JSON INVÁLIDO\n";
            $errors[] = "[$relativePath] Sintaxe JSON corrompida: " . json_last_error_msg();
            continue;
        }

        // Caso 1: JSON Schema
        if (isset($data['$schema'])) {
            echo "🟢 JSON Schema Válido\n";
            continue;
        }

        // Caso 2: Especificação de Endpoints do Nexus
        if (isset($data['endpoints']) && is_array($data['endpoints'])) {
            $endpointErrors = [];
            foreach ($data['endpoints'] as $index => $endpoint) {
                if (!isset($endpoint['method'])) {
                    $endpointErrors[] = "Endpoint #$index sem campo 'method'";
                }
                if (!isset($endpoint['path'])) {
                    $endpointErrors[] = "Endpoint #$index sem campo 'path'";
                }
                if (!isset($endpoint['response']) || !isset($endpoint['response']['status'])) {
                    $endpointErrors[] = "Endpoint #$index sem especificação de 'response' ou 'status'";
                }
            }

            // Validar caminhos de conformidade (compliance) se declarados
            if (isset($data['compliance'])) {
                foreach ($data['compliance'] as $layer => $path) {
                    $fullPath = $baseDir . '/' . str_replace('\\', '/', $path);
                    if (!file_exists($fullPath)) {
                        $endpointErrors[] = "Arquivo de compliance para a camada '$layer' não encontrado em: $path";
                    }
                }
            }

            if (empty($endpointErrors)) {
                echo "🟢 Endpoints e Compliance Ok\n";
            } else {
                echo "❌ FALHA DE CONTRATO\n";
                foreach ($endpointErrors as $err) {
                    $errors[] = "[$relativePath] $err";
                    echo "   - $err\n";
                }
            }
        } else {
            echo "🟡 Formato desconhecido (Ignorado)\n";
        }
    }
}

echo "\n📊 Resumo da Auditoria:\n";
echo "Total de contratos analisados: $validatedCount\n";

if (!empty($errors)) {
    echo "❌ Falhas encontradas:\n";
    foreach ($errors as $error) {
        echo "  - $error\n";
    }
    exit(1);
} else {
    echo "🟢 Todos os contratos validados com sucesso!\n";
    exit(0);
}
