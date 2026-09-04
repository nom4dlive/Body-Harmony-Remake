?? Objetivo Fullstack
[Descrição cirúrgica do problema e o que a alteração resolve nas diversas camadas do sistema]


?? Contratos de API (REGRA 1)
Contrato JSON criado/atualizado em openspec/contracts/{modulo}/{endpoint}.json
Validar 100% de simetria do payload de entrada e saída com tipagem estrita


?? Espaço Negativo (Fora de Escopo)
Infraestrutura Docker/Traefik e restrição de loopback (127.0.0.1:3306) do MySQL (Imutável - REGRA 2)
[Limites e barreiras específicas que não serão tocadas neste Delta]


??? Camada de Dados (SQL)
Migrations criadas em infrastructure/database/migrations/V{ID}__{desc}.sql com charset utf8mb4_unicode_ci
Garantir que colunas monetárias usem INT UNSIGNED (centavos) e is_active para ativações


?? Camada de Backend (PHP 8.4)
Services dedicados e desacoplados em BodyHarmony\Services\*
Controllers finos em apps/web-app/src/backend/api/v1/ com validação de entrada contra o contrato JSON
Teste de fumaça standalone CLI criado/atualizado em tests/{modulo}_smoke_test.php com MockPDO em memória


?? Camada de Interface (React V3.1)
Componentes e hooks em apps/web-app/src/frontend/src/ com styled-components Luxury
Conformidade de estilos: Navy Blue (#0A3E60), Gold (#ED7E13), alvos >= 44x44px, Mobile-First
Tratamento defensivo de loading/error, formatCurrency seguro e <ErrorBoundary />


?? Roteamento do Deploy Híbrido
Hostinger Web Hosting (45.152.44.244): [Componentes React SPA e endpoints PHP da API principal]
VPS Hostinger Dedicada (2.25.156.25): [Banco MySQL, containers Docker, Evolution API ou microserviços]


?? Monitoramento Semântico (Regression Watch)
Rotas e arquivos críticos mapeados e listados em openspec/tracker/regression-watch.md
Critérios manuais de aceitação para assegurar zero regressão


??? Matriz de Risco & Rollback
Risco: [Definição clara do risco de quebra de contrato ou regressão]
Mitigação: [Medida preventiva]
Rollback: [Instruções de reversão rápida via Git / snapshot]


? Checklist de Execução Atômica
1. Criar/Atualizar Contrato JSON em openspec/contracts/
2. Criar migrations SQL correspondentes e validar charset/constraints
3. Implementar regras de negócio e validações no Backend PHP 8.4
4. Atualizar UI do Frontend com styled-components e layout V3.1
5. Executar php tests/{modulo}_smoke_test.php e validar 100% PASS
6. Executar npm run build na SPA e verificar zero erros de compilação
7. Arquivar o delta via /archive para openspec/archive/

