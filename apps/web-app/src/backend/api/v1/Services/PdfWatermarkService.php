<?php

namespace BodyHarmony\Services;

use Mpdf\Mpdf;
use Exception;

class PdfWatermarkService {
    private string $tempDir;

    public function __construct() {
        // Robust Temp Directory Selection for Hostinger
        $candidates = [
            sys_get_temp_dir() . '/mpdf',
            __DIR__ . '/../../../../tmp/mpdf',
            $_SERVER['DOCUMENT_ROOT'] . '/../tmp/mpdf'
        ];

        foreach ($candidates as $dir) {
            if (!file_exists($dir)) {
                @mkdir($dir, 0755, true);
            }
            if (is_dir($dir) && is_writable($dir)) {
                $this->tempDir = $dir;
                break;
            }
        }

        // Fallback if no writable dir found
        if (empty($this->tempDir)) {
            $this->tempDir = sys_get_temp_dir(); // Hope for the best
        }
    }

    /**
     * Applies a dynamic watermark to a PDF file based on configuration.
     * 
     * @param string $pdfPath Full path to the source PDF
     * @param array $licenciadaData ['name' => 'Name', 'cpf' => '123...']
     * @param array $config Nested config [text => [], logo => [], security => []]
     * @param string|null $iconsDir Directory containing forensic icons
     * @return string Path to the watermarked PDF (temporary file)
     */
    public function applyWatermark(string $pdfPath, array $licenciadaData, array $config = [], ?string $iconsDir = null): string {
        if (!file_exists($pdfPath)) {
            throw new Exception("Source PDF not found: " . $pdfPath);
        }

        // 1. Initial configuration
        $iconsDir = $iconsDir ?: (defined('PUBLIC_ROOT') ? PUBLIC_ROOT . '/assets/icons/' : dirname(__DIR__, 6) . '/apps/web-app/src/frontend/src/assets/icons/');
        
        $textConf = $config['text'] ?? ['x' => 105, 'y' => 148, 'opacity' => 0.08, 'visible' => true];
        $logoConf = $config['logo'] ?? ['x' => 25, 'y' => 25, 'opacity' => 0.05, 'visible' => false];
        $secConf = $config['security'] ?? ['x' => 185, 'y' => 275, 'opacity' => 0.05, 'visible' => false];

        try {
            $mpdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'tempDir' => $this->tempDir,
                'margin_footer' => 10,
                'default_font' => 'dejavusans',
                'autoScriptToLang' => true,
                'autoLangToFont' => true
            ]);
        } catch (Exception $e) {
            error_log("[PdfWatermarkService] Failed to initialize mPDF: " . $e->getMessage());
            throw $e;
        }
        
        $pageCount = $mpdf->SetSourceFile($pdfPath);
        
        // Normalize Name to ASCII to prevent rendering artifacts
        $cleanName = $this->sanitizeName($licenciadaData['name']);
        
        for ($i = 1; $i <= $pageCount; $i++) {
            $tplId = $mpdf->ImportPage($i);
            $size = $mpdf->getTemplateSize($tplId);
            
            $mpdf->AddPage($size['width'] > $size['height'] ? 'L' : 'P');
            $mpdf->UseTemplate($tplId);

            // Layering Logic
            
            // 1. Logo Layer
            if (($logoConf['visible'] ?? false)) {
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
                    $mpdf->SetAlpha($logoConf['opacity'] ?? 0.05);
                    $size = $logoConf['size'] ?? 30;
                    $mpdf->Image($logoPath, $logoConf['x'] ?? 10, $logoConf['y'] ?? 10, $size, $size, 'svg', '', true, false);
                }
            }

            // 2. Security Shield Layer
            if (($secConf['visible'] ?? false)) {
                $securityPath = $iconsDir . 'security-icon.svg';
                if (file_exists($securityPath)) {
                    $mpdf->SetAlpha($secConf['opacity'] ?? 0.05);
                    $size = $secConf['size'] ?? 20;
                    $mpdf->Image($securityPath, $secConf['x'] ?? 170, $secConf['y'] ?? 260, $size, $size, 'svg', '', true, false);
                }
            }

            // 3. Text ID Layer
            if (($textConf['visible'] ?? true)) {
                $mpdf->SetAlpha($textConf['opacity'] ?? 0.08);
                $fontSize = $textConf['size'] ?? 10;
                $mpdf->SetFont('dejavusans', 'B', $fontSize);
                
                // Format: Document generated for exclusive use of: Name (CPF: 000...)
                // Line 1: Header
                $headerText = "Documento gerado para uso exclusivo de:";
                $mpdf->Text($textConf['x'] ?? 50, $textConf['y'] ?? 50, $headerText);

                // Line 2: Licenciada Info (normalized)
                $studentInfo = mb_strtoupper($cleanName, 'UTF-8') . " (CPF: " . ($licenciadaData['cpf'] ?? 'N/D') . ")";
                // Convert font point size to mm roughly (1pt ~ 0.35mm). Adding a bit of leading.
                $lineHeightMm = ($fontSize * 0.35) * 1.5; 
                $mpdf->Text($textConf['x'] ?? 50, ($textConf['y'] ?? 50) + $lineHeightMm, $studentInfo);
            }

            // Standard Footer (Audit Trail)
            $mpdf->SetAlpha(1.0);
            $footerHtml = '
                <div style="font-size: 7pt; border-top: 0.1mm solid #0A3E60; padding-top: 2mm; color: #888; font-family: Arial;">
                    <table width="100%">
                        <tr>
                            <td width="70%"><b>Acesso Seguro:</b> ' . htmlspecialchars($cleanName) . ' (CPF: ' . htmlspecialchars($licenciadaData['cpf'] ?? 'N/D') . ')</td>
                            <td width="30%" align="right">Forensic ID: ' . date('Ymd-His') . '</td>
                        </tr>
                    </table>
                </div>';
            $mpdf->SetHTMLFooter($footerHtml);
        }

        $mpdf->SetAlpha(1.0);
        $tempFile = $this->tempDir . DIRECTORY_SEPARATOR . 'protected_' . uniqid() . '.pdf';
        $mpdf->Output($tempFile, 'F');
        
        return $tempFile;
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
