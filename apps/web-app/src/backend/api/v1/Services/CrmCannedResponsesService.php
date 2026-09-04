<?php
// apps/web-app/src/backend/api/v1/Services/CrmCannedResponsesService.php
// Body Harmony Nexus V3.1 — CRM Canned Responses & Sales Macros Engine (PLAN-176)

namespace BodyHarmony\Services;

class CrmCannedResponsesService {
    private mixed $db;
    private string $chatwootBaseUrl;
    private string $chatwootApiToken;

    public function __construct(
        mixed $db = null,
        ?string $chatwootBaseUrl = null,
        ?string $chatwootApiToken = null
    ) {
        $this->db = $db;
        $this->chatwootBaseUrl = rtrim($chatwootBaseUrl ?? $_ENV['CHATWOOT_BASE_URL'] ?? 'https://crm.bodyharmony.com.br', '/');
        $this->chatwootApiToken = $chatwootApiToken ?? $_ENV['CHATWOOT_API_TOKEN'] ?? 'wxvcKsycZEXjrqM7dxD72oNm';
    }

    public function getDefaultMacros(): array {
        return [
            [
                'short_code' => 'congresso_exp',
                'content' => "✨ *CONGRESSO BODY HARMONY 2026 — INGRESSO EXPERIENCE* ✨\n\nGaranta sua vaga na maior imersão de estética avançada e eletroestimulação muscular do Brasil!\n\n💎 *Acesso Experience:* R$ 697,00 (ou até 12x no cartão)\n📅 *Data:* 24 e 25 de Outubro de 2026\n📍 *Local:* Espaço Matriz Body Harmony\n\n👉 *Garanta seu ingresso agora pelo link oficial:*\nhttps://bodyharmony.com.br/shop/checkout/1\n\nFicou com alguma dúvida sobre o cronograma? Estou à disposição!"
            ],
            [
                'short_code' => 'congresso_vip',
                'content' => "👑 *CONGRESSO BODY HARMONY 2026 — INGRESSO VIP COM CASHBACK* 👑\n\nUma experiência exclusiva para profissionais que desejam liderar o mercado de eletroestimulação!\n\n💎 *Acesso VIP:* R$ 1.497,00\n🔥 *BÔNUS EXCLUSIVO:* 100% do valor (R$ 1.497,00) revertido como crédito no Licenciamento de Tecnologia Body Harmony!\n✨ Assentos nas primeiras fileiras + Mentoria fechada com a Dra. Josi Silva + Kit VIP Oficial.\n\n👉 *Checkout seguro do Ingresso VIP:*\nhttps://bodyharmony.com.br/shop/checkout/2"
            ],
            [
                'short_code' => 'pix_matriz',
                'content' => "🏦 *DADOS BANCÁRIOS OFICIAIS — BODY HARMONY MATRIZ* 🏦\n\nPara pagamentos de sessões, procedimentos e taxas via PIX:\n\n🔑 *Chave PIX (CNPJ):* 68.016.506/0001-22\n🏢 *Favorecido:* BODY HARMONY ELETROESTIMULAÇÃO LTDA.\n📍 *Cidade:* Assis/SP\n\n_Por favor, após realizar a transferência, envie o comprovante aqui nesta conversa para baixa imediata no seu prontuário!_ ✨"
            ],
            [
                'short_code' => 'pix_clinica',
                'content' => "🏦 *DADOS BANCÁRIOS OFICIAIS — BODY HARMONY MATRIZ* 🏦\n\nPara pagamentos de sessões, procedimentos e taxas via PIX:\n\n🔑 *Chave PIX (CNPJ):* 68.016.506/0001-22\n🏢 *Favorecido:* BODY HARMONY ELETROESTIMULAÇÃO LTDA.\n📍 *Cidade:* Assis/SP\n\n_Por favor, após realizar a transferência, envie o comprovante aqui nesta conversa para baixa imediata no seu prontuário!_ ✨"
            ],
            [
                'short_code' => 'horarios_clinica',
                'content' => "📅 *GRADE DE HORÁRIOS DISPONÍVEIS — CLÍNICA MATRIZ* 📅\n\nOlá! Temos as seguintes opções de horários abertos para sua avaliação e sessão de eletroestimulação nesta semana:\n\n▫️ *Manhã:* 08:30 | 09:30 | 10:30\n▫️ *Tarde:* 14:00 | 15:30 | 17:00\n▫️ *Noite:* 18:30 (horário especial)\n\nQual desses períodos fica mais confortável para a sua rotina?"
            ],
            [
                'short_code' => 'anamnese',
                'content' => "📋 *FICHA DE ANAMNESE ESTÉTICA DIGITAL — BODY HARMONY* 🌸\n\nOlá! Para prepararmos o seu protocolo personalizado de eletroestimulação com segurança máxima, por favor preencha sua ficha rápida de triagem clínica no link oficial abaixo:\n\n👉 https://forms.gle/4j9XqUuRj2G2V3yMA\n\nLeva menos de 2 minutos e seus dados são sincronizados diretamente com o prontuário da clínica!"
            ]
        ];
    }

    public function syncMacrosToChatwoot(): array {
        $macros = $this->getDefaultMacros();
        $syncedCount = 0;

        foreach ($macros as $macro) {
            $url = "{$this->chatwootBaseUrl}/api/v1/accounts/1/canned_responses";
            $payload = [
                'short_code' => $macro['short_code'],
                'content' => $macro['content']
            ];

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    "api_access_token: {$this->chatwootApiToken}"
                ],
                CURLOPT_TIMEOUT => 5
            ]);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($code >= 200 && $code < 300) {
                $syncedCount++;
            }
        }

        return [
            'success' => true,
            'synced_count' => $syncedCount,
            'macros' => $macros,
            'message' => "Foram sincronizadas {$syncedCount} macros de respostas rápidas oficiais no Chatwoot."
        ];
    }

    public function listMacros(): array {
        return [
            'success' => true,
            'synced_count' => count($this->getDefaultMacros()),
            'macros' => $this->getDefaultMacros()
        ];
    }
}
