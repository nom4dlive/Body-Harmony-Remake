# 🛡️ Nexus Command Center

O Nexus é o painel administrativo avançado do ecossistema Body Harmony ("God Mode"), focado em analytics de segurança, monitoramento em tempo real (Watchtower) e inteligência estratégica (War Room).

## 🎨 Identidade Visual (Nexus Dark Mode)

Diferente do Portal Gestor (Claro/Clean), o Nexus utiliza um **Hard Dark Mode** para imersão e diferenciação de contexto.

- **Background:** `#050A10` (Preto Profundo)
- **Surface:** `#0A3E60` (Azul Navy Nexus)
- **Primary:** `#316B9C` (Azul Tático)
- **Accent:** `#ED7E13` (Laranja Alerta)
- **Text:** `#FFFFFF` (Branco Puro)
- **Text Secondary:** `#A0AEC0` (Cinza Metálico)
- **Border:** `#1A2A40`

> **Nota:** Componentes do Nexus devem ter cores hardcoded ou usar um Theme Provider isolado para garantir que não herdem estilos do tema light do portal principal.

## 👁️ Módulo: Watchtower

Monitoramento de segurança e atividade em tempo real.

### Endpoint
- `GET /api/v1/admin/analytics/watchtower`

### Métricas (Nexus V123)
1. **Active Agents (24h):** Usuários distintos logados nas últimas 24h.
2. **Ops Completed:** Total de aulas concluídas em todo o ecossistema.
3. **Global Progress:** Média percentual de progresso de todos estudantes.
4. **Threats:** Alertas de logins suspeitos ou ataques de força bruta.
5. **System Health:** Latência de DB (`db_latency_ms`) e taxa de erro (`error_rate_1h`).

## 🧠 Doctor Harmony Intelligence Layer
O **Doctor Harmony** opera como a camada proativa de IA sobre o Nexus.

### Funções Principais:
- **Watchdog (Segurança):** Monitoramento de `audit_logs` para bloqueio automatizado de vetores de ataque.
- **Mentor (Engagement):** Disparo de gatilhos motivacionais e detecção de abandono de curso.
- **Clinical (Technical Support):** Análise multimodal de casos clínicos via **Gemini 2.0 Flash**, fornecendo pareceres técnicos instantâneos para licenciadas.

## ⚠️ Governança
- Decisões autônomas do Doctor Harmony são marcadas como `agent: DOCTOR_HARMONY` no `audit_logs`.
- Casos de baixa confiança (< 75%) são sinalizados no **Watchtower** para revisão humana.
- Logs de acesso críticos (Login, Ban) são salvos em `audit_logs`.
- Logs de navegação (View, Play) são salvos em `lms_access_logs`.
