# Especificação: Ciclo de Vida de Autenticação (Licenciadas)

## 1. Primeiro Acesso (Onboarding)
- **Credenciais Iniciais:**
    - Login: Handle do Instagram (sanitizado: lowercase, trim, sem @).
    - Senha: Padrão do sistema (`bodyharmony010203` ou definida pelo Admin).
- **Force Change Password:**
    - Todas as novas contas (ou resets) iniciam com a flag `force_pass_change = 1`.
    - Ao logar com esta flag, o sistema bloqueia o acesso a qualquer rota exceto `/portal-licenciada/nova-senha`.
    - O token JWT/Session deve indicar este estado restrito.

## 2. Redefinição de Senha
- **Self-Service:**
    - A licenciada pode alterar sua senha a qualquer momento no perfil "Acesso & Segurança".
- **Admin Reset:**
    - O Admin pode resetar a senha de uma licenciada.
    - Opcionalmente, o Admin pode marcar "Obrigar troca no próximo login".

## 3. Segurança & Feedback de Erro
- As senhas nunca são armazenadas em texto plano (Hash `PASSWORD_DEFAULT`).
- Logs de segurança devem registrar trocas de senha e falhas de login.
- **Tratamento de Erros (V87.0):**
    - Redirecionamentos automáticos em caso de erro são proibidos para evitar fricção.
    - O Backend deve retornar códigos de diagnóstico (`INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `ACCOUNT_INACTIVE`, `THROTTLED`).
    - O Frontend exibe CTAs de suporte (WhatsApp/IA) dinamicamente dentro do componente de login.
