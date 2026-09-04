# 🎯 PLAN-108: Workflow Ponta a Ponta de Quizzes, Horas Reais & Certificação Oficial Luxury

## 📌 [OBJETIVO]
Consolidar a esteira completa e integrada de:
1. **Quizzes nos Módulos**: Card/Botão "Fazer Avaliação" na lista de aulas do módulo no portal, permitindo à aluna realizar a prova e atualizar a nota em tempo real.
2. **Cálculo de Horas Reais**: Injetar o tempo líquido de vídeo concluído (`SUM(duration_seconds)`) no certificado e no checklist.
3. **Texto Jurídico/Habilitatório**: Atualizar o template padrão para a redação alinhada (`está devidamente habilitada na metodologia {course}, tendo cumprido todos os módulos e avaliações com {hours} de estudo e nota {score}.`).
4. **Página Pública de Validação (`/validar/:hash`)**: Criar tela Luxury Navy/Gold com selo verde de autenticidade para leitura via QR Code.

---

## 🛡️ [ESPAÇO NEGATIVO]
- Proibido expor dados confidenciais (CPF, e-mail) na tela pública de validação.
- Proibido gerar certificado com nota ou horas estáticas caso os dados reais estejam no banco.
- Proibido quebrar rotas existentes de licenciadas ou alunas.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3 a 5 min)]

- [ ] **Passo 1: Atualizar Template Oficial & Cálculo de Horas Líquidas (`CertificateController.php` & `CertificateService.php`)**
  - Inserir a redação jurídica como padrão em `lms_certificate_templates`.
  - Calcular `{hours}` a partir de `SUM(l.duration_seconds)` das aulas concluídas pela aluna.

- [ ] **Passo 2: Endpoint Público de Validação de Certificados (`CertificateController::verifyPublic`)**
  - `GET /v1/certificates/verify/{hash}` retornando dados do certificado público.

- [ ] **Passo 3: Card de Quiz no Portal de Aulas (`MyLessonsPage.jsx` & `AlunaLessonPlayer.jsx`)**
  - Adicionar card "Avaliação do Módulo" ao final de cada módulo com status (Aprovado / Pendente) e gatilho do modal de quiz.

- [ ] **Passo 4: Página Pública de Autenticidade Luxury (`CertificateVerificationPage.jsx`)**
  - Rota `/validar/:hash` no React com design Luxury Navy/Gold, selo de autenticidade e botão para visualizar o PDF.

- [ ] **Passo 5: Verificação Deterministica & Nexus Hard Gate**
  - `php -l`, build Vite e `scripts/nexus_gate.ps1` com Exit Code 0.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/Controllers/CertificateController.php`
- `apps/web-app/src/backend/api/v1/Services/CertificateService.php`
- `apps/web-app/src/backend/api/v1/index.php`
- `apps/web-app/src/frontend/src/pages/Public/CertificateVerificationPage.jsx`
- `apps/web-app/src/frontend/src/pages/Portal/MyLessons/MyLessonsPage.jsx`
- `apps/web-app/src/frontend/src/pages/Portal/components/QuizModal.jsx`
- `apps/web-app/src/frontend/src/App.jsx`
