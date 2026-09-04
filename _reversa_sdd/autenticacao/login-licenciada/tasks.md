# Tasks: Login de Licenciada

> Identificador: `001-autenticacao-login-licenciada`
> Confidência: 🟢 CONFIRMADO

| # | Tarefa | Arquivo Legado | Critério de Pronto | Conf. |
|---|--------|----------------|-------------------|-------|
| 1 | Implementar endpoint POST /v1/auth/login | AuthController.php | Request com login+password retorna token | 🟢 |
| 2 | Implementar busca multicampo (cpf/email/username) | AuthController.php:128 | Login funciona com qualquer um dos 3 campos | 🟢 |
| 3 | Implementar checkThrottling() | AuthController.php:205 | 3 falhas = lock 15 min | 🟢 |
| 4 | Implementar device token resolution | AuthController.php:276 | Device reusado por fingerprint; FIFO se exceder | 🟢 |
| 5 | Implementar registro em auth_logs | AuthController.php | Toda tentativa registrada com status + IP | 🟢 |
| 6 | Implementar reset de failed_login_attempts | AuthController.php | Login bem-sucedido zera contador | 🟢 |
