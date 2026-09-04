# Tasks: Login de Aluna

> Identificador: `001-autenticacao-login-aluna`
> Confidência: 🟢 CONFIRMADO

| # | Tarefa | Arquivo Legado | Critério de Pronto | Conf. |
|---|--------|----------------|-------------------|-------|
| 1 | Implementar POST /v1/aluna/auth/login | AlunaAuthController.php | Aluna com email+senha válidos recebe token | 🟢 |
| 2 | Implementar prefixo 'al_' no token | AlunaAuthController.php:162 | Todo token gerado começa com "al_" | 🟢 |
| 3 | Implementar force_password_change | AlunaAuthController.php | Se força=true, response inclui flag | 🟢 |
| 4 | Implementar verificação is_approved | AlunaAuthController.php | Aluna não aprovada não loga | 🟡 |
| 5 | Implementar device resolution | AlunaAuthController.php | Device token reusado ou criado | 🟢 |
