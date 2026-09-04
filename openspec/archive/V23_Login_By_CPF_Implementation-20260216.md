🔐 Protocolo de Implementação: Login Híbrido (Email/CPF)

Versão: 1.0
Status: 🟡 Planejamento
Prioridade: Alta (Melhoria de UX/Acessibilidade)

Este documento descreve as alterações necessárias para permitir que a licenciada realize login utilizando seu E-mail ou seu CPF (sanitizado), mantendo a integridade do sistema de autenticação via JWT.

1. ⚙️ Alterações no Backend (PHP 8.2 Vanilla)

Local: apps/web-app/src/backend/api/v1/Controllers/AuthController.php

🧠 Lógica de Identificação

O sistema deve detectar se a entrada é um e-mail ou um CPF (apenas números).

/**
 * Lógica sugerida para o método de Login
 */
public function login(Request $request) {
    $loginInput = $request->get('login'); // Pode ser email ou cpf
    $password = $request->get('password');

    // 1. Sanitização para caso de CPF
    $cleanInput = preg_replace('/\D/', '', $loginInput);
    
    // 2. Construção da Query Dinâmica
    // Buscamos pelo e-mail original OU pelo CPF sanitizado
    $sql = "SELECT id, name, email, cpf, password, role FROM users 
            WHERE email = :input OR cpf = :cleanInput 
            LIMIT 1";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
        ':input' => $loginInput,
        ':cleanInput' => $cleanInput
    ]);

    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Gera Token JWT e retorna sucesso
        return $this->generateAuthResponse($user);
    }

    return $this->errorResponse("Credenciais inválidas", 401);
}


2. 🖥️ Alterações no Frontend (React + Vite)

Local: apps/web-app/src/frontend/src/pages/Auth/Login.jsx

💡 UX de Input Único

O campo de login deve ser amigável. Não aplicaremos máscara rígida no campo de login para não impedir quem digita o e-mail, mas daremos a dica visual.

// No componente Login.jsx
const [identifier, setIdentifier] = useState(""); // E-mail ou CPF

// Renderização do campo
<div className="nexus-input-group">
  <label>E-mail ou CPF</label>
  <input 
    type="text"
    value={identifier}
    onChange={(e) => setIdentifier(e.target.value)}
    placeholder="Ex: licenciada@email.com ou 000.000.000-00"
    className="input-navy-gold"
  />
</div>


3. 🛡️ Segurança & NexusGuard

Rate Limiting: O NexusGuard deve continuar monitorando tentativas falhas por IP, independentemente se o usuário tentou via CPF ou E-mail.

Sanitização Incondicional: No backend, o valor testado contra a coluna cpf deve sempre passar por preg_replace('/\D/', '', $input) para evitar SQL Injection ou erros de comparação.

Ambbiguidade de Erro: Nunca informar se o "CPF não existe" ou "E-mail não existe". Manter a mensagem genérica: "Usuário ou senha incorretos".

4. 📝 Plano de Testes

Caso de Teste

Entrada

Resultado Esperado

Login via E-mail

perla@exemplo.com

Sucesso (Token JWT)

Login via CPF (Formatado)

724.401.041-91

Sucesso (Sanitizado p/ 72440104191)

Login via CPF (Limpo)

72440104191

Sucesso

Login Inexistente

00000000000

Erro 401

SQL Injection Test

' OR 1=1 --

Bloqueio via NexusGuard/PDO

5. ✅ Próximos Passos

[ ] Validar se a coluna cpf já foi criada e populada (Ver: V23_CPF_Implementation.md).

[ ] Modificar o AuthController.php no ambiente de Dev (Docker).

[ ] Testar fluxo completo no Postman antes de subir o Frontend.

🔐 Protocolo de Implementação: Login Híbrido (Email/CPF)

Versão: 1.0
Status: 🟡 Planejamento
Prioridade: Alta (Melhoria de UX/Acessibilidade)

Este documento descreve as alterações necessárias para permitir que a licenciada realize login utilizando seu E-mail ou seu CPF (sanitizado), mantendo a integridade do sistema de autenticação via JWT.

1. ⚙️ Alterações no Backend (PHP 8.2 Vanilla)

Local: apps/web-app/src/backend/api/v1/Controllers/AuthController.php

🧠 Lógica de Identificação

O sistema deve detectar se a entrada é um e-mail ou um CPF (apenas números).

/**
 * Lógica sugerida para o método de Login
 */
public function login(Request $request) {
    $loginInput = $request->get('login'); // Pode ser email ou cpf
    $password = $request->get('password');

    // 1. Sanitização para caso de CPF
    $cleanInput = preg_replace('/\D/', '', $loginInput);
    
    // 2. Construção da Query Dinâmica
    // Buscamos pelo e-mail original OU pelo CPF sanitizado
    $sql = "SELECT id, name, email, cpf, password, role FROM users 
            WHERE email = :input OR cpf = :cleanInput 
            LIMIT 1";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
        ':input' => $loginInput,
        ':cleanInput' => $cleanInput
    ]);

    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Gera Token JWT e retorna sucesso
        return $this->generateAuthResponse($user);
    }

    return $this->errorResponse("Credenciais inválidas", 401);
}


2. 🖥️ Alterações no Frontend (React + Vite)

Local: apps/web-app/src/frontend/src/pages/Auth/Login.jsx

💡 UX de Input Único

O campo de login deve ser amigável. Não aplicaremos máscara rígida no campo de login para não impedir quem digita o e-mail, mas daremos a dica visual.

// No componente Login.jsx
const [identifier, setIdentifier] = useState(""); // E-mail ou CPF

// Renderização do campo
<div className="nexus-input-group">
  <label>E-mail ou CPF</label>
  <input 
    type="text"
    value={identifier}
    onChange={(e) => setIdentifier(e.target.value)}
    placeholder="Ex: licenciada@email.com ou 000.000.000-00"
    className="input-navy-gold"
  />
</div>


3. 🛡️ Segurança & NexusGuard

Rate Limiting: O NexusGuard deve continuar monitorando tentativas falhas por IP, independentemente se o usuário tentou via CPF ou E-mail.

Sanitização Incondicional: No backend, o valor testado contra a coluna cpf deve sempre passar por preg_replace('/\D/', '', $input) para evitar SQL Injection ou erros de comparação.

Ambbiguidade de Erro: Nunca informar se o "CPF não existe" ou "E-mail não existe". Manter a mensagem genérica: "Usuário ou senha incorretos".

4. 📝 Plano de Testes

Caso de Teste

Entrada

Resultado Esperado

Login via E-mail

perla@exemplo.com

Sucesso (Token JWT)

Login via CPF (Formatado)

724.401.041-91

Sucesso (Sanitizado p/ 72440104191)

Login via CPF (Limpo)

72440104191

Sucesso

Login Inexistente

00000000000

Erro 401

SQL Injection Test

' OR 1=1 --

Bloqueio via NexusGuard/PDO

5. ✅ Próximos Passos

[ ] Validar se a coluna cpf já foi criada e populada (Ver: V23_CPF_Implementation.md).

[ ] Modificar o AuthController.php no ambiente de Dev (Docker).

[ ] Testar fluxo completo no Postman antes de subir o Frontend.

[ ] Estabilizar todos os testes em ambiente de Dev (Docker).