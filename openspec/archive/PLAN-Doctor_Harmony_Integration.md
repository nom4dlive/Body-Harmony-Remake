# IMPL-Doctor_Harmony_Integration: Full-Stack Checklist

**Objetivo:** Finalizar a transição de "ANA" para "Doctor Harmony" em todas as camadas do sistema, garantindo consistência técnica e visual.

---

## 🔍 Planejamento (!S, !P)

### Impacto Identificado
- **Frontend:** `DoctorHarmonyWidget.jsx`, `api.js`, `DataContext.jsx` (config).
- **Backend:** `MentorIAController.php` (Renomar para `DoctorHarmonyController`), `index.php` (Rotas).
- **Database:** `site_config` (Atualizar nome da IA), `audit_logs` (Migrar registros antigos - opcional/low prio, focar em novos).
- **API:** Padronizar endpoints para `/v1/doctor-harmony/*`.

### Diagrama de Fluxo (Proposed)
1. **Student:** `DoctorHarmonyWidget` -> `api.doctorHarmony.evaluate()` -> `POST /v1/doctor-harmony/evaluate`
2. **Backend:** `Router` -> `DoctorHarmonyController->analyze()` -> `GeminiService`
3. **Database:** `ai_clinical_cases` (Insert) -> `ai_mentorship_logs` (Insert)
4. **Admin:** `ReviewHub` -> `AdminDoctorHarmonyController` -> `ai_clinical_cases` (Select/Update)

### Contratos de API (Refatoração)

#### 1. Avaliação Clínica (Student)
- **De:** `POST /v1/lms/ai/evaluate` (Legacy)
- **Para:** `POST /v1/doctor-harmony/evaluate`
- **Controller:** `DoctorHarmonyController` (Ex-MentorIAController)

#### 2. Consultar Créditos (Student)
- **De:** `GET /v1/lms/ai/credits`
- **Para:** `GET /v1/doctor-harmony/credits`

#### 3. Admin Config (Admin)
- **Manter:** `/v1/admin/doctor-harmony/*` (Já implementado no `index.php`, verificar `AdminDoctorHarmonyController`).

---

## 📋 Implementação (!I)

### 1. Backend & API
- [ ] **Renomear Controller:** `MentorIAController.php` -> `DoctorHarmonyController.php`.
- [ ] **Atualizar Rotas (`index.php`):**
    - Mover rotas de `/lms/ai/*` para `/doctor-harmony/*`.
    - Atualizar instâncias de `MentorIAController` para `new DoctorHarmonyController()`.
- [ ] **Limpeza:** Remover referências a "Ana" nos comentários e variáveis internas do Controller.

### 2. Frontend
- [ ] **Atualizar `api.js`:**
    - Apontar métodos `doctorHarmony` para os novos endpoints `/v1/doctor-harmony/*`.
- [ ] **Verificar `DoctorHarmonyWidget.jsx`:**
    - Garantir que não há strings "ANA" hardcoded.
    - Confirmar uso de `api.doctorHarmony`.
- [ ] **Styles:**
    - Verificar se as cores estão usando `#ED7E13` (Gold) e `#0A3E60` (Navy) conforme `theme.js`.

### 3. Database
- [ ] **Migration (SQL):**
    - Atualizar `site_config`: `UPDATE site_config SET config_value = 'Doctor Harmony' WHERE config_key = 'ai_name';`
    - (Opcional) Migrar logs antigos se crítico. *Decisão: Manter logs antigos como histórico, focar em novos.*

---

## ✅ Validação (!V)

### Testes Manuais
- [ ] **Fluxo de Avaliação:** Enviar uma mensagem no Widget. Verificar se retorna resposta da "Dra. Harmony".
- [ ] **Fluxo de Erro:** Tentar enviar sem créditos (mock) ou verificar tratamento de erro.
- [ ] **Admin:** Acessar configurações da Doctor Harmony no painel Admin.

---

## 📂 Arquivamento (!A)
- [ ] Atualizar `task.md`.
- [ ] Atualizar `walkthrough.md`.
