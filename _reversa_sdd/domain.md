# Glossário e Regras de Domínio — Body Harmony

> Gerado pelo Detective em 2026-06-02
> Confiança: 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

## Glossário

| Termo | Definição |
|-------|-----------|
| **Licenciada** | Profissional que compra o curso. Perfil principal do sistema. Acessa LMS, mentoria IA, biblioteca, certificados. |
| **Aluna** | Cliente final da licenciada. Perfil secundário com acesso limitado a módulos específicos. |
| **Admin** | Administrador do sistema (backoffice). Gerencia licenciadas, alunas, LMS, conteúdo, mídia. |
| **Superadmin (Nexus/God Mode)** | Acesso irrestrito: gerenciamento de admins, NexusGuard, Watchtower, Signal Tower, Vault, Engines, scripts, database. |
| **Doctor Harmony** | Mentora IA clínica baseada em Gemini Vision. Analisa fotos/áudios de casos reais. |
| **Nexus** | Framework de segurança + superadmin. Inclui Guard, Watchtower, Signal Tower, War Room, Vault, Engine Room. |
| **Watchtower** | Central de monitoramento de segurança. Detecta compartilhamento de conta, anomalias de IP, dispositivos suspeitos. |
| **Signal Tower** | Sistema de comunicados/broadcasts com targeting por role e tracking de leitura. |
| **War Room** | Deep analytics: DAU, device stats, churn risk. |
| **Vault** | Repositório de configurações sensíveis (FAQ, features). |
| **Engine Room** | Gerenciamento de cache (ResponseCache) e feature flags. |
| **ResponseCache** | Sistema de cache disco-based com stale-while-revalidate. Segmentação público vs privado (por token). |
| **Device Token** | Token único de dispositivo para licenciadas e alunas. Usado como identificador de sessão (X-Device-Token, X-ALUNA-TOKEN). |
| **Strict Progression** | Sistema de bloqueio de módulos: módulo N+1 só desbloqueia se quiz do módulo N foi aprovado. |
| **Hybrid Review** | Sistema de revisão clínica: IA analisa, mas se confiança < 80%, vai para mentor humano. |
| **Crisis Alert** | Detecção de palavras de desistência no texto da licenciada. Força revisão prioritária. |
| **Nexus Firewall** | Bloqueio de IP via SQLite/MySQL com regras de BAN e expiração. |
| **LGPD Consent** | Consentimento da licenciada para uso de dados pessoais na IA. Armazenado em `licenciadas.lgpd_status`. |

## Regras de Negócio

### Autenticação e Sessão
1. **🟢** Admin autentica via Bearer Token (admin_sessions, 6h de validade)
2. **🟢** Licenciada autentica via device token (X-Device-Token) armazenado em `licenciada_devices`
3. **🟢** Aluna autentica via device token (X-ALUNA-TOKEN) armazenado em `aluna_devices`
4. **🟢** Licenciada: limite de 2 dispositivos simultâneos (max_devices=2). Aluna: limite de 1 (max_devices=1)
5. **🟢** Token de aluna tem prefixo `al_` para diferenciação
6. **🟢** Sessão admin expira em 6h; sessão superadmin (NexusGuard) expira em 24h
7. **🟢** Force password change: admin ou sistema pode forçar troca de senha no próximo login

### Segurança (Nexus)
8. **🟢** IP pode ser banido permanentemente ou temporariamente (3h expiry) via `security_ip_rules`
9. **🟢** Compartilhamento de conta detectado: >3 devices OU >2 IPv4 nas últimas 72h
10. **🟢** IPv6 é ignorado em alerts de compartilhamento (falsos positivos de CGNAT/privacy iOS)
11. **🟢** Testers (is_tester=1) são excluídos dos alerts de segurança
12. **🟢** Dados sensíveis (password, token, secret, key) são redactados nos logs do NexusLogger
13. **🟢** NexusGuard auth verifica IP whitelist (NEXUS_ALLOWED_IPS) antes de qualquer operação superadmin
14. **🟡** Lockout de licenciada: após `failed_login_attempts` consecutivos, conta bloqueada até `locked_until`

### LMS e Progressão
15. **🟢** Módulo N+1 bloqueado se módulo N tem quiz e não foi aprovado (Strict Progression)
16. **🟢** Progresso de aula é salvo via UPSERT (UPDATE if exists, INSERT if not)
17. **🟢** Ao completar aula pela 1ª vez, loga LESSON_COMPLETE; 1ª reprodução loga PLAY
18. **🟢** Cache de módulos (`api_lms_modules_{userId}`) é invalidado ao salvar progresso
19. **🟢** Certificado só é emitido se quiz foi passado (score >= min_score, passed=1)
20. **🟢** Quiz: se score >= min_score (default 70), marca passed=1; senão, registra tentativa
21. **🟢** Progresso de vídeo é salvo com debounce via frontend (useProgressQueue)
22. **🟡** Licenciada pode ter acesso a biblioteca de recursos via `lms_resource_access`
23. **🟡** Aluna tem acesso modular: `aluna_course_access` define quais módulos ela pode ver

### Doctor Harmony (Mentoria IA)
24. **🟢** Créditos de IA controlados por license: `ai_credits_total` vs `ai_credits_used`
25. **🟢** Admin bypass: admins não consomem créditos ao analisar casos
26. **🟢** LGPD: dados pessoais da licenciada só enviados à IA se `lgpd_status.ai_usage = true`
27. **🟢** Crisis detection: palavras-chave (desistir, parar, cancelar...) forçam status=PENDING + needs_review=1
28. **🟢** Hybrid Review: se confidence < 0.80, caso vai para revisão humana obrigatória
29. **🟢** Sandbox: admin pode testar prompts sem salvar no banco
30. **🟢** Fallback de upload: PRIVATE_UPLOADS_DIR → sys_temp_dir se não houver permissão

### Conteúdo e Site
31. **🟢** Leads: sanitização rigorosa (FILTER_SANITIZE_EMAIL, strip_tags, preg_replace whatsapp)
32. **🟢** Mentores: endpoint público lista todos; CRUD protegido por admin
33. **🟢** FAQ: apenas superadmin pode gerenciar (admin/vault/faq_manager.php)
34. **🟢** Broadcasts: podem ter target_roles (licenciada, aluna) para direcionamento
35. **🟢** Broadcasts ativos: endpoint retorna apenas NÃO LIDOS via LEFT JOIN com NULL check

### Cache e Performance
36. **🟢** ResponseCache: stale-while-revalidate. Cache público é global; cache privado segmentado por token
37. **🟢** Cache de módulos: TTL 300s (5 min) privado por usuário
38. **🟢** Cache admin LMS: prefixo `admin_lms_modules_` invalidado em CRUD
39. **🟢** Frontend: Stability Shield retry automático (2x, exponential backoff 1s/2s) para 500/503
40. **🟢** Frontend: Nexus Cache (V48) — cache em memória 60s para GETs pesados

### Feature Flags
41. **🟢** Feature flags limitadas: apenas `maintenance_mode` (admin/engine/feature_flags.php)
42. **🟢** Maintenance mode: when active, site público exibe página de manutenção
