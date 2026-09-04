<?php

namespace BodyHarmony\Services;

use Mpdf\Mpdf;
use Exception;

class PdfFingerprintService {
    private string $encryptionKey;

    public function __construct() {
        // In production, this should come from a secure source
        $this->encryptionKey = getenv('PDF_METADATA_ENCRYPTION_KEY') ?: 'default_secret_key_change_me';
    }

    /**
     * Injects encrypted metadata and returns file hash.
     * 
     * @param string $pdfPath Path to the input PDF
     * @param array $metadata Data to inject (licenciada_id, cpf, timestamp, etc.)
     * @return array ['path' => string, 'hash' => string]
     * @throws Exception
     */
    public function injectFingerprint(string $pdfPath, array $metadata): array {
        if (!file_exists($pdfPath)) {
            throw new Exception("PDF not found: " . $pdfPath);
        }

        // 1. Prepare Metadata Payload
        $payload = json_encode($metadata);
        $encryptedPayload = $this->encryptPayload($payload);

        // 2. Process PDF to inject metadata
        $mpdf = new Mpdf();
        $pageCount = $mpdf->SetSourceFile($pdfPath);

        // Copy pages
        for ($i = 1; $i <= $pageCount; $i++) {
            $tplId = $mpdf->ImportPage($i);
            $size = $mpdf->getTemplateSize($tplId);
            $mpdf->AddPage($size['width'] > $size['height'] ? 'L' : 'P');
            $mpdf->UseTemplate($tplId);
        }

        // 3. Inject Metadata
        $mpdf->SetAuthor('Body Harmony Secured');
        $mpdf->SetCreator('Nexus Forensics System');
        $mpdf->SetSubject('Protected Document');
        
        // Inject payload into Keywords (standard field)
        $mpdf->SetKeywords($encryptedPayload);
        
        try {
            // 4. Output Final PDF
            $tempDir = sys_get_temp_dir();
            $finalPath = $tempDir . DIRECTORY_SEPARATOR . 'secure_' . uniqid() . '.pdf';
            $mpdf->Output($finalPath, 'F');

            if (!file_exists($finalPath)) {
                throw new Exception("mPDF failed to generate fingerprint PDF: " . $finalPath);
            }
        } catch (Exception $e) {
            error_log("[PdfFingerprintService] mPDF Output Error: " . $e->getMessage());
            throw $e;
        }

        // 5. Calculate Hash
        $fileHash = hash_file('sha256', $finalPath);

        return [
            'path' => $finalPath,
            'hash' => $fileHash
        ];
    }

    private function encryptPayload(string $data): string {
        $cipher = "aes-256-cbc";
        $ivlen = openssl_cipher_iv_length($cipher);
        $iv = openssl_random_pseudo_bytes($ivlen);
        $ciphertext_raw = openssl_encrypt($data, $cipher, $this->encryptionKey, OPENSSL_RAW_DATA, $iv);
        $hmac = hash_hmac('sha256', $ciphertext_raw, $this->encryptionKey, true);
        return base64_encode($iv . $hmac . $ciphertext_raw);
    }

    /**
     * Extracts and decrypts metadata from a PDF.
     */
    public function extractFingerprint(string $pdfPath): ?array {
        if (!file_exists($pdfPath)) return null;

        // Try to read file to find Keywords
        $content = file_get_contents($pdfPath);
        
        if (preg_match('/\/Keywords\s*\(([^)]+)\)/', $content, $matches)) {
            $encryptedData = $matches[1];
            $encryptedData = str_replace(['\\)', '\\(', '\\\\'], [')', '(', '\\'], $encryptedData);
            
            return $this->decryptPayload($encryptedData);
        }
        
        return null;
    }

    private function decryptPayload(string $ciphertext): ?array {
        $c = base64_decode($ciphertext);
        $cipher = "aes-256-cbc";
        $ivlen = openssl_cipher_iv_length($cipher);
        
        if (strlen($c) < $ivlen + 32) return null; // IV + HMAC(32)
        
        $iv = substr($c, 0, $ivlen);
        $hmac = substr($c, $ivlen, 32);
        $ciphertext_raw = substr($c, $ivlen + 32);
        
        $calcmac = hash_hmac('sha256', $ciphertext_raw, $this->encryptionKey, true);
        if (!hash_equals($hmac, $calcmac)) return null; // Integrity check failed
        
        $original_plaintext = openssl_decrypt($ciphertext_raw, $cipher, $this->encryptionKey, OPENSSL_RAW_DATA, $iv);
        return json_decode($original_plaintext, true);
    }

    /**
     * Generates an active PDF matrix for a student.
     */
    public function generateMatrix(array $studentData, array $adminData, array $config): array {
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_left' => 0,
            'margin_right' => 0,
            'margin_top' => 0,
            'margin_bottom' => 0,
            'default_font' => 'dejavusans',
            'autoScriptToLang' => true,
            'autoLangToFont' => true
        ]);

        $mpdf->AddPage();

        // 1. Watermark Layer (The Forensics Metadata)
        $metadata = [
            'licenciada_id' => $studentData['id'],
            'licenciada_name' => $studentData['name'],
            'cpf' => $studentData['cpf'],
            'timestamp' => time(),
            'admin' => $adminData['name'],
            'admin_ip' => $adminData['ip'],
            'type' => 'ACTIVE_MATRIX'
        ];

        $encryptedPayload = $this->encryptPayload(json_encode($metadata));
        $mpdf->SetKeywords($encryptedPayload);
        $mpdf->SetAuthor('Body Harmony Matrix Generator');

        // Normalize Name to ASCII
        $cleanName = $this->sanitizeName($studentData['name']);

        // 2. Visual Layers
        $iconsDir = defined('PUBLIC_ROOT') ? PUBLIC_ROOT . '/assets/icons/' : dirname(__DIR__, 6) . '/apps/web-app/src/frontend/src/assets/icons/';

        // Logo Layer
        $logoConf = $config['logo'] ?? ['x' => 10, 'y' => 10, 'opacity' => 0.1, 'visible' => false, 'size' => 30];
        if ($logoConf['visible'] ?? ($config['show_logo'] ?? false)) {
            $logoCandidates = [
                'f:/Body-Harmony-Remake/apps/web-app/src/frontend/public_html/logo.svg',
                $_SERVER['DOCUMENT_ROOT'] . '/logo.svg',
                $iconsDir . 'logo.svg',
                $iconsDir . 'BH-icon.svg'
            ];
            $logoPath = null;
            foreach ($logoCandidates as $cand) {
                if (file_exists($cand)) {
                    $logoPath = $cand;
                    break;
                }
            }

            if ($logoPath) {
                $mpdf->SetAlpha($logoConf['opacity'] ?? 0.1);
                $size = $logoConf['size'] ?? 30;
                $mpdf->Image($logoPath, $logoConf['x'] ?? 10, $logoConf['y'] ?? 10, $size, $size, 'svg', '', true, false);
            }
        }

        // Security Icon Layer
        $secConf = $config['security'] ?? ['x' => 170, 'y' => 260, 'opacity' => 0.05, 'visible' => false, 'size' => 20];
        if ($secConf['visible'] ?? ($config['show_security'] ?? false)) {
            $securityPath = $iconsDir . 'security-icon.svg';
            if (file_exists($securityPath)) {
                $mpdf->SetAlpha($secConf['opacity'] ?? 0.05);
                $size = $secConf['size'] ?? 20;
                $mpdf->Image($securityPath, $secConf['x'] ?? 170, $secConf['y'] ?? 260, $size, $size, 'svg', '', true, false);
            }
        }

        // Text Layer (Student Info)
        $textConf = $config['text'] ?? ['x' => 50, 'y' => 50, 'opacity' => 0.1, 'visible' => true, 'size' => 12];
        if ($textConf['visible'] ?? true) {
            $mpdf->SetAlpha($textConf['opacity'] ?? 0.1);
            $fontSize = $textConf['size'] ?? 12;
            $mpdf->SetFont('dejavusans', 'B', $fontSize);
            
            // Format: Document generated for exclusive use of: Name (CPF: 000...)
            $headerText = "Documento gerado para uso exclusivo de:";
            $studentInfo = mb_strtoupper($cleanName, 'UTF-8') . " (CPF: " . ($studentData['cpf'] ?? 'N/D') . ")";
            
            // Use MultiCell for multi-line support if needed, or two Text calls
            $mpdf->Text($textConf['x'] ?? 50, $textConf['y'] ?? 50, $headerText);
            $mpdf->Text($textConf['x'] ?? 50, ($textConf['y'] ?? 50) + ($fontSize / 2), $studentInfo);
        }

        // Admin Info (Discreet - Always show at bottom for audit)
        $mpdf->SetAlpha(0.05);
        $mpdf->SetFont('Arial', '', 6);
        $adminInfo = "Generated by: " . $adminData['name'] . " (" . $adminData['ip'] . ") at " . date('Y-m-d H:i:s');
        $mpdf->Text(5, 292, $adminInfo);

        $mpdf->SetAlpha(1); // Reset

        try {
            $tempDir = sys_get_temp_dir();
            $fileName = 'matrix_' . $studentData['id'] . '_' . time() . '.pdf';
            $finalPath = $tempDir . DIRECTORY_SEPARATOR . $fileName;
            $mpdf->Output($finalPath, 'F');

            if (!file_exists($finalPath)) {
                throw new Exception("mPDF failed to generate matrix PDF.");
            }
        } catch (Exception $e) {
            error_log("[PdfFingerprintService] Matrix Generation Error: " . $e->getMessage());
            throw $e;
        }

        return [
            'path' => $finalPath,
            'name' => $fileName,
            'hash' => hash_file('sha256', $finalPath)
        ];
    }

    /**
     * Normalizes string to ASCII (removes accents/diacritics) for PDF compatibility.
     * Manual mapping to ensure consistent behavior across all environments.
     */
    private function sanitizeName(string $str): string {
        $map = [
            'Á' => 'A', 'À' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A',
            'É' => 'E', 'È' => 'E', 'Ê' => 'E', 'Ë' => 'E',
            'Í' => 'I', 'Ì' => 'I', 'Î' => 'I', 'Ï' => 'I',
            'Ó' => 'O', 'Ò' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O',
            'Ú' => 'U', 'Ù' => 'U', 'Û' => 'U', 'Ü' => 'U',
            'Ç' => 'C', 'Ñ' => 'N',
            'á' => 'a', 'à' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o',
            'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
            'ç' => 'c', 'ñ' => 'n'
        ];
        return str_replace(array_keys($map), array_values($map), $str);
    }
}
