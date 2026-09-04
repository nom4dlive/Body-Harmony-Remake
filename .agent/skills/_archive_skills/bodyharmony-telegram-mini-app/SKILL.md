---
name: bodyharmony-telegram-mini-app
description: Desenvolvimento Web Nativo para Telegram Mini Apps com React/Vite (Body Harmony)
---

# 📱 Body Harmony Telegram Mini App (TWA)

**Role:** Desenvolvedor TWA (Telegram Web Apps)
**Design System:** V3.1 (Navy #0A3E60 / Gold #ED7E13)

Esta skill orienta a construção de pequenos aplicativos embarcados no Telegram (TWA) para as licenciadas gerenciarem alunos de forma ultra-rápida, sem abrir navegadores externos.

## 🏗️ Core Setup (React/Vite)

Para inicializar a integração do Body Harmony Web App dentro do ambiente Telegram, siga este padrão:

### 1. Injeção da SDK do Telegram
Sempre insira o script oficial no `index.html` do frontend SPA (`apps/web-app/src/frontend/public/index.html` ou equivalente):
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### 2. O Telegram Context Hook (React)
A UI deve obedecer as cores nativas para evitar ofuscamento, e usar a SDK `window.Telegram.WebApp`.

```javascript
import { useEffect, useState } from 'react';

export function useTelegramTWA() {
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready(); 
      webApp.expand(); // Abre no modo full height
      setTg(webApp);
    }
  }, []);

  return tg;
}
```

### 3. Conformidade UX e Autenticação
- **Theme Variables:** Utilize `tg.themeParams.bg_color` ou force o tema *Light/Navy* do Body Harmony. No entanto, o `MainButton` nativo do Telegram é vital.
- **Main Button:** Em fluxos como "Adicionar Novo Aluno", invoque `tg.MainButton.setText()` e `tg.MainButton.show()` ao em vez de botões flutuantes via CSS. É nativo, confiável e evita delay de scroll.
- **Autenticação:** Capture `tg.initDataUnsafe.user.id`. Envie isso nos headers da sua API (`apps/web-app/src/backend/...`) via HTTPS. O backend valida a conta atrelada ao `telegram_user_id` e devolve um JWT. **NÃO DEPENDA** apenas de id limpo; mande a hash `initData` completa via request para o PHP validar pelo `BOT_API_KEY`.

## ⚙️ Regras Estritas do Mini App Body Harmony
1. **Telas Ocultam Navegação:** Use React Router, mas nunca os links ou back buttons convencionais do chrome. Utilize o `tg.BackButton.show()` se navegou fora da Root.
2. **Mobile First Extremo & High-Density:** `padding: 10px 14px`, gaps entre cards $\le 0.4\text{rem}$ (`6px`), fontes legíveis (`>= 14px`), inputs com tamanho $\ge 16\text{px}$ para evitar auto-zoom indesejado no iOS.
3. **Zero Whitespace Waste (Otimização 100vh):** Em viewports restritos do Telegram, elimine margens mortas superiores/inferiores (`margin-bottom \le 0.75rem`), aproveitando o espaço útil visível sem exigir scroll vertical imediato.
4. **Evitar Modais CSS:** No Telegram, modais nativos são recomendados via `tg.showPopup()`. Poupam código e entregam estabilidade no mobile de gama baixa.

**Integra-se com:** `bodyharmony-telegram-bot` e `react-ui-patterns`.
