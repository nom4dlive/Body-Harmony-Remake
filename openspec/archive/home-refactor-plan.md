# 🧠 Brainstorm: Reestruturação da Home Page (Story-Driven Conversion)

## 🎯 Objetivo
Transformar a Home Page de um "Cartão de Visitas Institucional" (Genérico) para uma "Máquina de Vendas B2B" (Focada em Licenciadas), utilizando a estratégia de Copy já validada (`00_Copy_Strategy_Guide`).

## 🚨 Diagnóstico Atual (`Home.jsx`)
| Seção | Estado Atual | Problema (Gap) |
| :--- | :--- | :--- |
| **Hero** | "Transforme sua carreira" | Genérico. Não cria conexão emocional imediata nem autoridade. |
| **Sobre** | ZigZag genérico sobre o método | Frio. Ignora a jornada de superação da Josi (Obesidade -> Campeã). |
| **Benefícios** | Ícones padrão | Focam em "O que trata", não em "Por que vende" (Lucro/Diferenciação). |
| **Prova Social** | Galeria de Resultados | Falta a "Voz da Licenciada" (Ex: Lilian e a "Máquina vs Método"). |

## 💡 Proposta de Nova Estrutura

### 1. Hero Section: A Promessa da Autoridade
*   **Headline:** "Não é sobre a Máquina. É sobre o Método."
*   **Subheadline:** "Descubra como transformar o equipamento que você já tem em uma ferramenta de faturamento de R$ 5k/dia com o Protocolo Body Harmony."
*   **CTA:** "Quero Ser Uma Referência na Minha Cidade"
*   **Background:** Vídeo/Imagem High-End da Josi aplicando ou no palco (Autoridade).

### 2. Seção "Pain vs Solution" (Baseado em `Dor_Solucao.md`)
*   **Conceito:** "Corpo de Academia sem pegar peso."
*   **Copy:** "Sua cliente quer resultados de atleta, mas tem rotina de mãe. O Body Harmony entrega a intensidade fisiológica que a academia leva meses para construir, em apenas 1 sessão."
*   **Visual:** Comparativo Lado a Lado (Fisiologia x Estética Comum).

### 3. A Jornada da Heroína (Baseado em `Autoridade_Pratica.md`)
*   **Título:** "De Obesa a Campeã Brasileira em 5 Meses."
*   **Narrativa:** A história da Josi. Mostrar que o método foi validado na pele dela.
*   **Gatilho:** "Eu não ensino teoria de livro. Eu ensino o que funcionou no meu corpo quando nada mais funcionava."
*   **Foto:** Antes (Obesidade) e Depois (Palco com Troféu).

### 4. O Diferencial de Mercado (Baseado em `Lilian.md`)
*   **Conceito:** "Ter um bisturi não te faz cirurgião."
*   **Destaque:** Depoimento da Lilian (Licenciada Venda Nova).
*   **Copy:** "Muitas têm a máquina. Só você terá a Engenharia de Parâmetros Body Harmony."

### 5. CTA Final (Escassez Territorial)
*   **Headline:** "Apenas Uma Licenciada por Região."
*   **Input:** "Verificar Disponibilidade em [Sua Cidade]" (Link p/ WhatsApp).

## 🛠 Plano de Ação
1.  **Refatorar `HeroSection`**: Focar na "Big Idea" (Máquina vs Método).
2.  **Criar `StorySection`**: Componente novo para a história da Josi.
3.  **Atualizar `ZigZagSection`**: Substituir texto institucional por Copy de Vendas (Lilian/Dor).
4.  **Ajustar `StatsSection`**: Focar em Faturamento/Resultados das Licenciadas.
