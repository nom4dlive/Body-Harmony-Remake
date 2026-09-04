<?php

namespace BodyHarmony\Services;

use Mpdf\Mpdf;
use Exception;

class CertificateService {
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

        if (empty($this->tempDir)) {
            $this->tempDir = sys_get_temp_dir();
        }
    }

    /**
     * Generates a luxury certificate PDF in memory and returns the binary data.
     * 
     * @param string $recipientName Name of the student or licensee
     * @param string $courseOrModuleTitle Title of the completed course / module
     * @param float $score Score obtained (0-100)
     * @param string $issuedAt Date of issue
     * @param string $hash Unique verification hash
     * @param array $config Optional customized template settings from database
     * @return string PDF Binary content
     */
    public function generate(
        string $recipientName, 
        string $courseOrModuleTitle, 
        float $score, 
        string $issuedAt, 
        string $hash,
        array $config = []
    ): string {
        $formattedDate = date('d/m/Y', strtotime($issuedAt));
        $scorePercent = number_format($score, 1) . '%';

        $title = !empty($config['title']) ? htmlspecialchars($config['title']) : 'Certificado de Conclusão';
        $subtitle = !empty($config['subtitle']) ? htmlspecialchars($config['subtitle']) : 'Certificamos com distinção acadêmica que';
        $badgeText = !empty($config['badge_text']) ? htmlspecialchars($config['badge_text']) : 'ESTÉTICA E SAÚDE INTEGRATIVA';
        $workloadHours = !empty($config['workload_hours']) ? (int)$config['workload_hours'] : 60;
        $issuerName = !empty($config['issuer_name']) ? htmlspecialchars($config['issuer_name']) : 'Dra. Thais Borges';
        $issuerRole = !empty($config['issuer_role']) ? htmlspecialchars($config['issuer_role']) : 'Coordenação Técnica & Mentoria';
        
        $rawBodyText = !empty($config['body_text']) 
            ? $config['body_text'] 
            : "concluiu com êxito a {course} no portal de capacitação técnica do ecossistema Body Harmony, cumprindo integralmente toda a carga horária de {hours} e obtendo aproveitamento de {score} em avaliação de competência técnico-prática.";

        $escapedBody = htmlspecialchars($rawBodyText);
        $escapedTitle = htmlspecialchars($courseOrModuleTitle);
        $bodyHtml = str_replace(
            ['{course}', '{hours}', '{score}'],
            [
                "<span class='highlight'>“{$escapedTitle}”</span>", 
                "<strong>{$workloadHours} horas</strong>", 
                "<span class='highlight'>{$scorePercent}</span>"
            ],
            $escapedBody
        );

        // Elegant Gold & Navy Blue Luxury Certificate Template HTML
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
            
            body {
                font-family: 'Montserrat', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #FFFFFF;
                color: #222222;
            }
            .certificate-border {
                border: 15px solid #0A3E60;
                padding: 25px;
                height: 100%;
                box-sizing: border-box;
                position: relative;
            }
            .certificate-inner-border {
                border: 2px solid #ED7E13;
                padding: 35px;
                height: 96%;
                box-sizing: border-box;
                text-align: center;
                position: relative;
            }
            .watermark {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Playfair Display', serif;
                font-size: 80px;
                color: rgba(10, 62, 96, 0.03);
                font-weight: 700;
                letter-spacing: 12px;
                text-transform: uppercase;
                z-index: 0;
                white-space: nowrap;
            }
            .header-logo {
                font-family: 'Playfair Display', serif;
                font-size: 26px;
                font-weight: 700;
                color: #0A3E60;
                letter-spacing: 3px;
                margin-bottom: 4px;
                position: relative;
                z-index: 1;
            }
            .header-subtitle {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 4px;
                color: #ED7E13;
                margin-bottom: 25px;
                font-weight: 600;
                position: relative;
                z-index: 1;
            }
            .title {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #0A3E60;
                margin-bottom: 12px;
                font-style: italic;
                position: relative;
                z-index: 1;
            }
            .subtitle {
                font-size: 13px;
                color: #555555;
                margin-bottom: 25px;
                letter-spacing: 1px;
                position: relative;
                z-index: 1;
            }
            .recipient {
                font-size: 28px;
                font-weight: 700;
                color: #ED7E13;
                border-bottom: 2px solid #0A3E60;
                display: inline-block;
                padding-bottom: 4px;
                margin-bottom: 25px;
                font-family: 'Playfair Display', serif;
                position: relative;
                z-index: 1;
            }
            .content {
                font-size: 14px;
                line-height: 1.8;
                max-width: 720px;
                margin: 0 auto 35px auto;
                color: #444444;
                position: relative;
                z-index: 1;
            }
            .highlight {
                font-weight: 700;
                color: #0A3E60;
            }
            .footer-table {
                width: 100%;
                margin-top: 15px;
                border-collapse: collapse;
                position: relative;
                z-index: 1;
            }
            .signature-area {
                text-align: left;
                vertical-align: bottom;
            }
            .signature-name {
                font-size: 14px;
                font-weight: 700;
                color: #0A3E60;
                margin-bottom: 2px;
            }
            .signature-title {
                font-size: 11px;
                border-top: 1px solid #ED7E13;
                padding-top: 6px;
                width: 250px;
                color: #64748B;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .hash-box {
                font-size: 8.5px;
                color: #777777;
                font-family: monospace;
                text-align: right;
                vertical-align: bottom;
            }
            .hash-label {
                font-weight: bold;
                color: #ED7E13;
            }
            .seal-badge {
                font-size: 9px;
                color: #0A3E60;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 4px;
            }
        </style>
        </head>
        <body>
            <div class='certificate-border'>
                <div class='certificate-inner-border'>
                    <div class='watermark'>BODY HARMONY</div>
                    <div class='header-logo'>BODY HARMONY</div>
                    <div class='header-subtitle'>{$badgeText}</div>
                    
                    <div class='title'>{$title}</div>
                    <div class='subtitle'>{$subtitle}</div>
                    
                    <div class='recipient'>" . htmlspecialchars($recipientName) . "</div>
                    
                    <div class='content'>
                        {$bodyHtml}
                    </div>
                    
                    <table class='footer-table'>
                        <tr>
                            <td class='signature-area'>
                                <div class='signature-name'>{$issuerName}</div>
                                <div class='signature-title'>{$issuerRole}</div>
                                <div style='font-size: 10px; color: #777777; margin-top: 4px;'>Emissão: {$formattedDate} • Carga Horária: {$workloadHours}h</div>
                            </td>
                            <td class='hash-box'>
                                <div class='seal-badge'>• Certificação de Excelência •</div>
                                <span class='hash-label'>Autenticidade Digital:</span><br>{$hash}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </body>
        </html>
        ";

        try {
            $mpdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4-L',
                'tempDir' => $this->tempDir,
                'margin_left' => 10,
                'margin_right' => 10,
                'margin_top' => 10,
                'margin_bottom' => 10,
            ]);

            $mpdf->WriteHTML($html);
            return $mpdf->Output('', 'S'); // Returns PDF as binary string
        } catch (Exception $e) {
            throw new Exception("mPDF Error generating certificate: " . $e->getMessage());
        }
    }
}
