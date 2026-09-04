?? Regras Especializadas: Spec-Driven Development & Contratos
Manual de Invariantes de Governança SDD, Schemas JSON de Entrada/Saída e Ciclo de Vida de Deltas.


?? REGRA 1: Contratos de API Primeiro (Strict Contracts)
Diretriz: É expressamente proibido codificar Controllers PHP de backend ou services/hooks de comunicação React no frontend sem que a exata estrutura de payload de dados (JSON) esteja pré-estabelecida.
Ação: Toda modificação ou criação de rotas de dados deve possuir um arquivo de contrato associado em openspec/contracts/{endpoint_path}.json contendo a estrutura de input/output válida. O código final deve ter simetria matemática e semântica de 100% com o contrato.


?? REGRA 4: Simetria de Governança (Strict Mode)
Diretriz: Nenhum código produtivo pode ser alterado de forma ad-hoc ou "vibe coding". A documentação master e o código devem refletir o mesmo estado de forma biunívoca.
Ação:
Toda alteração nasce obrigatoriamente de uma especificação/plano em openspec/deltas/PLAN-*.md.
Todo plano deve declarar explicitamente o que está em escopo, o contrato JSON associado em openspec/contracts/ e o que é considerado "Espaço Negativo (Fora de Escopo)".
Ao concluir a execução atômica, o delta correspondente deve ser arquivado imediatamente na árvore histórica do repositório em openspec/archive/ via comando /archive.


?? REGRA 5: Guardrails de Workflow (Execution Safety)
Diretriz: Todo workflow que modifique código produtivo ou infraestrutura deve passar por um gate de pré-verificação antes da execução.
Ação:
/implement e /deploy exigem contrato JSON validado em openspec/contracts/ como pré-condição obrigatória.
/deploy deve referenciar /rollback como plano de contingência explícito.
Nenhum workflow pode referenciar scripts inexistentes, paths obsoletos ou versões depreciadas.
Toda referência a versão do protocolo deve ser V3.1 ou superior. Referências a V2.3 ou anteriores são proibidas.

