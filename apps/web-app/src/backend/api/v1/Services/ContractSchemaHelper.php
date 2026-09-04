<?php
// apps/web-app/src/backend/api/v1/Services/ContractSchemaHelper.php

namespace BodyHarmony\Services;

class ContractSchemaHelper
{
    /**
     * Normalizes and categorizes raw schema or HTML tags into 6 structured sections
     */
    public static function normalizeVariablesSchema($rawSchema, string $htmlContent): array
    {
        $sections = is_string($rawSchema) ? json_decode($rawSchema, true) : $rawSchema;

        // Check if it's already an array of section objects (each has 'id', 'title', 'fields')
        if (is_array($sections) && !empty($sections)) {
            $isSectionArray = true;
            foreach ($sections as $item) {
                if (!is_array($item) || !isset($item['fields']) || !is_array($item['fields'])) {
                    $isSectionArray = false;
                    break;
                }
            }
            if ($isSectionArray) {
                return $sections;
            }

            // If it's a flat array of fields:
            $isFlatFieldArray = true;
            foreach ($sections as $item) {
                if (!is_array($item) || !isset($item['key'])) {
                    $isFlatFieldArray = false;
                    break;
                }
            }
            if ($isFlatFieldArray) {
                return [
                    [
                        'id' => 'dados_principais',
                        'title' => 'Dados Principais',
                        'icon' => 'user',
                        'fields' => $sections
                    ]
                ];
            }
        }

        // Fallback: extract tags from HTML and categorize them intelligently
        preg_match_all('/{{\s*([A-Z0-9_]+)\s*}}/', $htmlContent, $matches);
        $tags = array_unique($matches[1] ?? []);

        if (empty($tags)) {
            return [];
        }

        $groups = [
            'qualificacao' => ['title' => '1. Qualificação das Partes', 'icon' => 'user', 'fields' => []],
            'operacao' => ['title' => '2. Territorialidade & Operação', 'icon' => 'map', 'fields' => []],
            'financeiro' => ['title' => '3. Condições Financeiras', 'icon' => 'dollar', 'fields' => []],
            'penalidades' => ['title' => '4. Penalidades & Multas', 'icon' => 'shield', 'fields' => []],
            'contato' => ['title' => '5. Contatos & Notificações', 'icon' => 'envelope', 'fields' => []],
            'fechamento' => ['title' => '6. Fechamento & Assinaturas', 'icon' => 'pen', 'fields' => []],
            'geral' => ['title' => 'Campos Adicionais', 'icon' => 'file', 'fields' => []]
        ];

        foreach ($tags as $tag) {
            $cleanLabel = ucwords(strtolower(str_replace('_', ' ', $tag)));
            $type = 'text';
            if (strpos($tag, 'EMAIL') !== false) $type = 'email';
            else if (strpos($tag, 'CPF') !== false && strpos($tag, 'CNPJ') !== false) $type = 'cpf_cnpj';
            else if (strpos($tag, 'CPF') !== false) $type = 'cpf';
            else if (strpos($tag, 'CNPJ') !== false) $type = 'cnpj';
            else if (strpos($tag, 'CEP') !== false) $type = 'cep';
            else if (strpos($tag, 'TELEFONE') !== false || strpos($tag, 'WHATSAPP') !== false) $type = 'phone';
            else if (strpos($tag, '_NUM') !== false || strpos($tag, 'VALOR') !== false) $type = 'currency';
            else if (strpos($tag, 'DATA') !== false) $type = 'date';

            $fieldObj = [
                'key' => $tag,
                'label' => $cleanLabel,
                'type' => $type,
                'required' => true,
                'default_value' => ''
            ];

            if (preg_match('/(RAZAO|NOME|RG|CPF|CNPJ|ENDERECO|CIDADE_UF|CIDADE_LICENCIADA|CEP|ESTADO_CIVIL|PROFISSAO|NACIONALIDADE|REPRESENTANTE|OUVINTE|ALUNA|PACIENTE|PARCEIRA|PAGADOR|EMISSOR|NASCIMENTO)/i', $tag)) {
                $groups['qualificacao']['fields'][] = $fieldObj;
            } else if (preg_match('/(OPERACIONAL|TERRITORIAL|LOCAL|ENDERECO_OPERACIONAL|CIDADE_OPERACIONAL|CURSO|EVENTO|MODALIDADE|CARGA_HORARIA|PROCEDIMENTO|AREAS_CORPOREAS|SESSOES|SALA|EQUIPAMENTOS|DIAS_HORARIOS)/i', $tag)) {
                $groups['operacao']['fields'][] = $fieldObj;
            } else if (preg_match('/(VALOR|TAXA|PAGAMENTO|FORMA_PAGAMENTO|HONORARIOS|COMISSAO|REPASSE|RECIBO|SERVICOS)/i', $tag)) {
                $groups['financeiro']['fields'][] = $fieldObj;
            } else if (preg_match('/(POS_CONTRATUAL|MULTA|SIGILO|PENALIDADE|RESCISAO|DESISTENCIA|ANAMNESE|SAUDE|MARCAPASSO|MEDICACOES|IMAGEM|VIGENCIA|AVISO_PREVIO)/i', $tag)) {
                $groups['penalidades']['fields'][] = $fieldObj;
            } else if (preg_match('/(EMAIL|TELEFONE|WHATSAPP|CONTATO|NOTIFICACAO)/i', $tag)) {
                $groups['contato']['fields'][] = $fieldObj;
            } else if (preg_match('/(DATA|CELEBRACAO|TESTEMUNHA|CIDADE_CELEBRACAO|CIDADE_DATA|CIDADE_EMISSAO|EMISSAO_EXTENSO|REGISTRO_CONSELHO|PROFISSIONAL)/i', $tag)) {
                $groups['fechamento']['fields'][] = $fieldObj;
            } else {
                $groups['geral']['fields'][] = $fieldObj;
            }
        }

        $result = [];
        foreach ($groups as $gid => $g) {
            if (!empty($g['fields'])) {
                $result[] = [
                    'id' => $gid,
                    'title' => $g['title'],
                    'icon' => $g['icon'],
                    'fields' => $g['fields']
                ];
            }
        }

        return $result;
    }
}
