---
name: bodyharmony-telegram-bot
description: Adaptado de Telegram Bot Builder (davila7) para Body Harmony (Nexus V3.1)
---

# 🤖 Body Harmony Telegram Bot Builder

**Role:** Arquiteto de Bots Telegram (Body Harmony)
**Objetivo:** Construir e manter o Bot de Suporte Telegram, focado em ajudar alunas e licenciadas sem burocracia, agindo sempre como um *cliente obediente* da API PHP do Body Harmony.

## 🛠️ Stack & Arquitetura (Body Harmony Padrão)
- **Linguagem:** Python 3.10+
- **Biblioteca:** `aiogram` 3.x (Asyncivo, Escalável)
- **Integração:** `httpx` ou `aiohttp` para consumo restrito da API Hostinger (`X-Bot-API-Key`).
- **Estados:** `aiogram.fsm` (Finite State Machine) para fluxos de onboarding/atualização.

## 🧠 Padrões Práticos para Body Harmony

### 1. FSM para Coleta de Dados (/atualizar)
Sempre utilize *FSM* para fluxos com múltiplos passos (ex: pedir CPF, Whatsapp, Instagram).

```python
from aiogram.fsm.state import State, StatesGroup

class UpdateProfile(StatesGroup):
    waiting_for_whatsapp = State()
    waiting_for_instagram = State()

@router.message(Command("atualizar"))
async def cmd_atualizar(message: Message, state: FSMContext):
    await message.answer("Por favor, digite seu Whatsapp com DDD (ex: 11999998888):")
    await state.set_state(UpdateProfile.waiting_for_whatsapp)
```

### 2. Consumo HTTP Obediente (Sem Regra de Negócio)
Nunca valide regras de licenciadas no Python. Sempre confie no PHP.

```python
async def test_login_api(cpf, password):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_BASE_URL}/auth/licenciada/login",
            json={"cpf": cpf, "senha": password},
            headers={"X-Bot-API-Key": BOT_API_KEY}
        )
        # Leia os códigos de erro do V87 (INVALID_CREDENTIALS, ACCOUNT_LOCKED)
        return response.json()
```

### 3. Teclados Interativos (Inline Keyboards)
Sempre priorize botões na tela em vez de obrigar a usuária a digitar.

```python
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

def get_support_menu():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔑 Recuperar Senha", callback_data="btn_senha")],
        [InlineKeyboardButton(text="📋 Verificar Cadastro", callback_data="btn_cadastro")]
    ])
```

## ❌ Anti-Patterns V3.1
- **❌ Blocking Operations:** Usar `requests` síncrono. O Telegram derruba requisições demoradas. *Solução*: Sempre usar Async (`httpx`, `aiohttp`).
- **❌ Acesso direto ao DB:** Usar `psycopg2` ou `aiomysql` no Python. *Solução*: O Bot acessa os dados **somente via POST/GET** na API Body Harmony.
- **❌ Textos Frios ou Robóticos:** Responder com JSON dumps ou frases de erro HTTP nuas. *Solução*: Aplique o humanizador e tom acolhedor (Skill: `bodyharmony-humanizer`).

## 🔗 Referências Relevantes
- `PLAN-V88-telegram-support-bot` (Base deste skill).
- [Documentação Oficial do aiogram](https://docs.aiogram.dev/en/latest/).
