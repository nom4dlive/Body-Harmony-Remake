# 👥 Spec: Mentors Page V2

**Source:** `Manual_Marca_Body_Harmony/Pages/Mentores.md` (V2 Refinement)
**Implemented:** v5.2.0

## 1. Visão Geral
Grid de 3 colunas focada na autoridade dos mentores, com fotos de grande destaque e hierarquia visual clara.

## 2. Cards de Mentores
- **Foto:** Circular, 200px (40-50% do card), com borda colorida (alternando `#316B9C` e `#ED7E13`).
- **Margem Negativa:** Foto "sai" do card para cima (`margin-top: -4rem`).
- **Tipografia:**
  - Nome: Montserrat Bold, Azul Escuro `#0A3E60`.
  - Cargo: Montserrat SemiBold, Azul Claro `#316B9C` (Uppercase).
  - Bio: Poppins Light, Azul Escuro `#0A3E60`.

## 3. CTA Final (Section)
- **Fundo:** `#0A3E60` (Azul Escuro Sólido).
- **Headline:**
  - Fonte: **Bison Bold**.
  - Texto: "UM LICENCIAMENTO RESPALDADO PELA MEDICINA..."
  - Cor: Branco.
- **Botão:**
  - Texto: "REGISTRE INTERESSE PARA A PRÓXIMA TURMA".
  - Cor: `#DD8F39` (Amarelo).
  - Hover: Scale + Shadow.

## 4. Implementação Técnica
- **Frontend:** `src/pages/Admin/MentorsManager.jsx` (Gestão) e `src/pages/Mentors/Mentors.jsx` (Público).
- **Service:** `src/services/api.js` (`getMentors`, `addMentor`, `updateMentor`, `deleteMentor`).
- **Backend Controller:** `ContentController.php`.
- **Database Mapping:** O frontend envia o campo `photo`, que é mapeado para `photo_url` no banco de dados para compatibilidade com o schema legado.
