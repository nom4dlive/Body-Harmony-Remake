# Tasks: Login de Admin

> Identificador: `001-autenticacao-login-admin`
> Confidência: 🟢 CONFIRMADO

| # | Tarefa | Arquivo Legado | Critério de Pronto | Conf. |
|---|--------|----------------|-------------------|-------|
| 1 | Implementar POST /v1/auth/login-admin | AuthController.php | Admin com credenciais válidas recebe token | 🟢 |
| 2 | Implementar geração de token SHA256 | AuthController.php | Token aleatório de 64 chars armazenado em admin_sessions | 🟢 |
| 3 | Implementar expiração de sessão | AuthController.php, AuthMiddleware.php | Token expirado retorna 401 | 🟢 |
| 4 | Implementar impersonificação | AuthController.php:176 | Admin loga como licenciada via ID negativo | 🟢 |
| 5 | Implementar logout admin | AuthController.php | DELETE na admin_sessions pelo token | 🟢 |
