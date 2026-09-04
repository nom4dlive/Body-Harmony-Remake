<?php
// apps/web-app/src/backend/api/v1/Services/ContactResolverService.php
// Body Harmony Nexus V3.1 — Smart Contact Normalizer & Resolver (PLAN-226)
// TopwebCRM Resiliency Pattern: 9th Digit Tolerance, LIDs & Cross-Entity Matching

namespace BodyHarmony\Services;

class ContactResolverService
{
    private $db;

    public function __construct($db = null)
    {
        $this->db = $db;
    }

    /**
     * Gera todas as variantes possíveis de um número telefônico brasileiro
     * (com/sem 55, com/sem 9º dígito, com/sem caracteres especiais).
     */
    public function generatePhoneVariants(string $phone): array
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (empty($digits)) {
            return [];
        }

        $variants = [$digits];

        // Se começa com código do Brasil (55)
        if (str_starts_with($digits, '55')) {
            $national = substr($digits, 2);
            $variants[] = $national;

            if (strlen($national) === 11) {
                // Com 9º dígito: 55 + DDD(2) + 9(1) + 8 dígitos -> Gera versão sem 9
                $ddd = substr($national, 0, 2);
                $ninth = substr($national, 2, 1);
                $rest = substr($national, 3);
                if ($ninth === '9') {
                    $withoutNineNational = $ddd . $rest;
                    $variants[] = $withoutNineNational;
                    $variants[] = '55' . $withoutNineNational;
                }
            } elseif (strlen($national) === 10) {
                // Sem 9º dígito: 55 + DDD(2) + 8 dígitos -> Gera versão com 9
                $ddd = substr($national, 0, 2);
                $rest = substr($national, 2);
                $withNineNational = $ddd . '9' . $rest;
                $variants[] = $withNineNational;
                $variants[] = '55' . $withNineNational;
            }
        } elseif (strlen($digits) === 11) {
            // Nacional com 9: DDD + 9 + 8 dígitos
            $variants[] = '55' . $digits;
            $ddd = substr($digits, 0, 2);
            $rest = substr($digits, 3);
            $withoutNine = $ddd . $rest;
            $variants[] = $withoutNine;
            $variants[] = '55' . $withoutNine;
        } elseif (strlen($digits) === 10) {
            // Nacional sem 9: DDD + 8 dígitos
            $variants[] = '55' . $digits;
            $ddd = substr($digits, 0, 2);
            $rest = substr($digits, 2);
            $withNine = $ddd . '9' . $rest;
            $variants[] = $withNine;
            $variants[] = '55' . $withNine;
        }

        return array_values(array_unique($variants));
    }

    /**
     * Formata qualquer número para visualização humana limpa (+55 (18) 9XXXX-XXXX).
     */
    public function formatDisplayPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (empty($digits)) {
            return $phone;
        }

        if (str_starts_with($digits, '55') && strlen($digits) === 13) {
            $ddd = substr($digits, 2, 2);
            $num1 = substr($digits, 4, 5);
            $num2 = substr($digits, 9, 4);
            return "+55 ({$ddd}) {$num1}-{$num2}";
        }

        if (str_starts_with($digits, '55') && strlen($digits) === 12) {
            $ddd = substr($digits, 2, 2);
            $num1 = substr($digits, 4, 4);
            $num2 = substr($digits, 8, 4);
            return "+55 ({$ddd}) {$num1}-{$num2}";
        }

        if (strlen($digits) === 11) {
            $ddd = substr($digits, 0, 2);
            $num1 = substr($digits, 2, 5);
            $num2 = substr($digits, 7, 4);
            return "({$ddd}) {$num1}-{$num2}";
        }

        if (strlen($digits) === 10) {
            $ddd = substr($digits, 0, 2);
            $num1 = substr($digits, 2, 4);
            $num2 = substr($digits, 6, 4);
            return "({$ddd}) {$num1}-{$num2}";
        }

        return str_starts_with($digits, '55') ? "+{$digits}" : $digits;
    }

    /**
     * Resolve e enriquece um contato a partir de seu JID ou Telefone,
     * cruzando com bases de Licenciadas, Alunas, Pacientes e Conversas anteriores.
     */
    public function resolveContact(string $remoteJid, ?string $pushName = null, ?string $instanceKey = null): array
    {
        $isGroup = str_ends_with($remoteJid, '@g.us');
        if ($isGroup) {
            return [
                'remote_jid' => $remoteJid,
                'canonical_phone' => 'Grupo do WhatsApp',
                'display_phone' => 'Grupo do WhatsApp',
                'name' => !empty($pushName) ? $pushName : 'Grupo do WhatsApp',
                'source' => 'GROUP',
                'is_group' => true,
                'is_registered' => false,
                'avatar_url' => null
            ];
        }

        $rawPhone = explode('@', $remoteJid)[0];
        $isLid = str_ends_with($remoteJid, '@lid');
        $displayPhone = $isLid ? 'WhatsApp LID' : $this->formatDisplayPhone($rawPhone);
        $variants = !$isLid ? $this->generatePhoneVariants($rawPhone) : [];

        $result = [
            'remote_jid' => $remoteJid,
            'canonical_phone' => $rawPhone,
            'display_phone' => $displayPhone,
            'name' => !empty($pushName) ? trim($pushName) : $displayPhone,
            'source' => 'WHATSAPP_PUSHNAME',
            'is_group' => false,
            'is_registered' => false,
            'avatar_url' => null,
            'details' => []
        ];

        if (!$this->db || !method_exists($this->db, 'prepare')) {
            return $result;
        }

        // Se não tiver variantes numéricas (ex: LID), buscar em crm_conversations pelo remote_jid ou pushName
        if (empty($variants) && $isLid) {
            try {
                $stmtLid = $this->db->prepare("SELECT contact_name, contact_phone FROM crm_conversations WHERE remote_jid = :jid LIMIT 1");
                $stmtLid->execute([':jid' => $remoteJid]);
                $lidRow = $stmtLid->fetch(\PDO::FETCH_ASSOC);
                if ($lidRow && !empty($lidRow['contact_name']) && $lidRow['contact_name'] !== 'Contato Sem Nome') {
                    $result['name'] = $lidRow['contact_name'];
                    $result['display_phone'] = $lidRow['contact_phone'] ?: $displayPhone;
                    $result['source'] = 'PREVIOUS_CONVERSATION';
                    return $result;
                }
            } catch (\Throwable $e) {}
            return $result;
        }

        $placeholders = implode(',', array_fill(0, count($variants), '?'));

        // 1. Cruzar com Licenciadas Oficiais
        try {
            $stmtLic = $this->db->prepare("
                SELECT id, nome_completo, email, cidade, estado, status_licenca, categoria 
                FROM licenciadas 
                WHERE REPLACE(REPLACE(REPLACE(REPLACE(telefone, ' ', ''), '-', ''), '(', ''), ')', '') IN ({$placeholders})
                   OR REPLACE(REPLACE(REPLACE(REPLACE(whatsapp, ' ', ''), '-', ''), '(', ''), ')', '') IN ({$placeholders})
                LIMIT 1
            ");
            $params = array_merge($variants, $variants);
            $stmtLic->execute($params);
            $lic = $stmtLic->fetch(\PDO::FETCH_ASSOC);
            if ($lic) {
                $result['name'] = $lic['nome_completo'];
                $result['source'] = 'LICENCIADA';
                $result['is_registered'] = true;
                $result['details'] = [
                    'type' => 'Licenciada Oficial',
                    'category' => $lic['categoria'] ?? 'Padrão',
                    'location' => ($lic['cidade'] ?? '') . ' - ' . ($lic['estado'] ?? ''),
                    'email' => $lic['email'] ?? ''
                ];
                return $result;
            }
        } catch (\Throwable $e) {}

        // 2. Cruzar com Alunas do LMS / Congressos
        try {
            $stmtAluna = $this->db->prepare("
                SELECT id, nome, email, status_matricula 
                FROM alunas 
                WHERE REPLACE(REPLACE(REPLACE(REPLACE(telefone, ' ', ''), '-', ''), '(', ''), ')', '') IN ({$placeholders})
                   OR REPLACE(REPLACE(REPLACE(REPLACE(celular, ' ', ''), '-', ''), '(', ''), ')', '') IN ({$placeholders})
                LIMIT 1
            ");
            $params = array_merge($variants, $variants);
            $stmtAluna->execute($params);
            $aluna = $stmtAluna->fetch(\PDO::FETCH_ASSOC);
            if ($aluna) {
                $result['name'] = $aluna['nome'];
                $result['source'] = 'ALUNA';
                $result['is_registered'] = true;
                $result['details'] = [
                    'type' => 'Aluna / Formação',
                    'status' => $aluna['status_matricula'] ?? 'Ativa',
                    'email' => $aluna['email'] ?? ''
                ];
                return $result;
            }
        } catch (\Throwable $e) {}

        // 3. Cruzar com Pacientes Clínicos
        try {
            $stmtPat = $this->db->prepare("
                SELECT id, patient_name, treatment_plan, current_session, last_appointment_at 
                FROM crm_patient_profiles 
                WHERE phone IN ({$placeholders})
                LIMIT 1
            ");
            $stmtPat->execute($variants);
            $pat = $stmtPat->fetch(\PDO::FETCH_ASSOC);
            if ($pat) {
                $result['name'] = $pat['patient_name'];
                $result['source'] = 'PATIENT';
                $result['is_registered'] = true;
                $result['details'] = [
                    'type' => 'Paciente Clínica Matriz',
                    'protocol' => $pat['treatment_plan'] ?? 'Protocolo 3S',
                    'session' => $pat['current_session'] ?? 1
                ];
                return $result;
            }
        } catch (\Throwable $e) {}

        // 4. Cruzar com Conversas Prévias Renomeadas
        try {
            $stmtPrev = $this->db->prepare("
                SELECT contact_name, contact_avatar 
                FROM crm_conversations 
                WHERE remote_jid = ? 
                   OR contact_phone IN ({$placeholders})
                LIMIT 1
            ");
            $paramsPrev = array_merge([$remoteJid], $variants);
            $stmtPrev->execute($paramsPrev);
            $prev = $stmtPrev->fetch(\PDO::FETCH_ASSOC);
            if ($prev && !empty($prev['contact_name']) && $prev['contact_name'] !== 'Contato Sem Nome' && !str_starts_with($prev['contact_name'], '+55')) {
                $result['name'] = $prev['contact_name'];
                $result['avatar_url'] = $prev['contact_avatar'] ?: null;
                $result['source'] = 'PREVIOUS_CONVERSATION';
                return $result;
            }
        } catch (\Throwable $e) {}

        return $result;
    }
}
