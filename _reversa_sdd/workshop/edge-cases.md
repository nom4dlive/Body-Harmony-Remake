# Edge Cases: Workshop

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Imagem não carrega
- Entrada: Componente renderiza com URL de imagem quebrada
- Comportamento esperado: `ImageWithFallback` exibe fallback ou placeholder 🟢
- Código: `Workshop.jsx` (usa ImageWithFallback)

### EC-02: Tela mobile
- Entrada: Viewport < 768px
- Comportamento esperado: Layout responsivo com clamp() para títulos e padding adaptável 🟢
- Código: `Workshop.jsx:32,38`

### EC-03: Rota inexistente
- Entrada: Acessar `/workshop/invalid`
- Comportamento esperado: React Router renderiza 404 ou redirect 🟡

### EC-04: Componente não encontrado (lazy load failure)
- Entrada: Falha no import lazy do Workshop
- Comportamento esperado: React Suspense fallback é exibido 🟢
- Código: `App.jsx:20`
