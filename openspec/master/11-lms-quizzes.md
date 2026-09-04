# 🎓 11-LMS-Quizzes (Phase 3)

> **Status:** Active
> **Version:** 2.0 (Nexus Era)
> **Owner:** Arquiteto Fullstack
> **Last Update:** 2026-05-29

---

## 1. Visão Geral (Overview)

A **Fase 3** introduz o sistema de avaliações (Quizzes) no LMS Body Harmony. O objetivo é validar o conhecimento do aluno ao final de módulos críticos e, futuramente, habilitar a emissão de certificados.

**Requisitos Chave:**
1.  **Vínculo com Módulos:** Cada quiz pertence a um módulo.
2.  **Bloqueio de Progresso:** (Opcional) O aluno só avança para o próximo módulo se atingir a nota mínima.
3.  **Feedback Imediato:** O aluno deve saber se passou ou não ao finalizar.
4.  **Admin Builder:** Interface simples para criar perguntas e respostas.

---

## 2. Database Schema (Schema V36.1)

Novas tabelas para suportar o motor de quiz.

### 2.1. `lms_quizzes`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | |
| `module_id` | INT (FK) | Módulo ao qual o quiz pertence. |
| `title` | VARCHAR | Título do Quiz (ex: "Avaliação do Módulo 1"). |
| `description` | TEXT | Instruções pré-quiz. |
| `min_score` | INT | Nota mínima para aprovação (0-100). Default: 70. |
| `created_at` | DATETIME | |

### 2.2. `lms_questions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | |
| `quiz_id` | INT (FK) | |
| `text` | TEXT | Enunciado da pergunta. |
| `image_ref` | VARCHAR | (Opcional) Imagem de apoio. |
| `type` | ENUM | 'single_choice', 'multiple_choice'. |
| `order_index` | INT | Ordem de exibição. |

### 2.3. `lms_question_options`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | |
| `question_id` | INT (FK) | |
| `text` | VARCHAR | Texto da opção. |
| `is_correct` | BOOLEAN | Identifica se é a resposta correta. |

### 2.4. `lms_quiz_attempts`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | |
| `student_id` | INT (FK) | |
| `quiz_id` | INT (FK) | |
| `score` | FLOAT | Nota final (0-100). |
| `passed` | BOOLEAN | Se atingiu `min_score`. |
| `answers_json` | JSON | Snapshot das respostas dadas pelo aluno. |
| `attempted_at` | DATETIME | |

---

## 3. UI/UX Specifications

### 3.1. Admin Panel (Quiz Builder)
- **Local:** Aba "Quiz" dentro do editor do Módulo em `AdminLMS`.
- **Flow:**
  1. Criar Quiz (Definir nota mínima).
  2. Adicionar Pertuna (Modal).
  3. Adicionar Opções para a pergunta.
  4. Marcar a correta.
  5. Salvar.

### 3.2. Student Portal (Quiz Runner)
- **Acesso:** Botão "Realizar Avaliação" aparece no final da lista de aulas do módulo.
- **Interface:** 
  - Layout limpo, foco na pergunta.
  - Progresso (Pergunta 1 de 10).
  - Botão "Finalizar" na última.
- **Resultado:**
  - Tela de Sucesso (Confetti + "Aprovado") ou Falha ("Tente novamente").
  - Botão "Avançar Módulo" só habilita após aprovação.

---

## 4. API Endpoints

### 4.1. Admin
- `GET /v1/admin/quiz?module_id=1`
- `POST /v1/admin/quiz` (Salva quiz, perguntas e opções em transação).

### 4.2. Student
- `GET /v1/lms/quiz?module_id=1` (Pega o quiz para jogar - sem marcar a correta).
- `POST /v1/lms/quiz/submit`
  - Payload: `{ quiz_id: 1, answers: { question_id: option_id, ... } }`
  - Return: `{ score: 80, passed: true, correction: {...} }`

---

## 5. Implementation Roadmap

1.  **Database:** Criar tabelas (`migrations/V15_Quizzes.sql`).
2.  **Backend:** Criar `QuizController` e `QuizService`.
3.  **Frontend Admin:** Criar `QuizEditor.jsx`.
4.  **Frontend Student:** Criar `QuizRunner.jsx`.
