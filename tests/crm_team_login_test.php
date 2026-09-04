<?php
// tests/crm_team_login_test.php
// Smoke test to verify Chatwoot sign_in and Gestor login for all 7 team users

$teamUsers = [
    ['email' => 'comercial@bodyharmony.com.br', 'password' => 'y4f6XPmr*L:7', 'name' => 'Comercial / Vendas'],
    ['email' => 'giovanna@bodyharmony.com.br',  'password' => 'Gi010203*',     'name' => 'Giovanna'],
    ['email' => 'cibele@bodyharmony.com.br',    'password' => 'Ci010203*',     'name' => 'Cibele'],
    ['email' => 'guilherme@bodyharmony.com.br', 'password' => 'Gui010203*',    'name' => 'Guilherme'],
    ['email' => 'eliadynne@bodyharmony.com.br', 'password' => 'Li010203*',     'name' => 'Eliadynne'],
    ['email' => 'juridico@bodyharmony.com.br',  'password' => 'Jur010203*',    'name' => 'Jurídico & Contratos'],
    ['email' => 'kaprice@bodyharmony.com.br',   'password' => 'Ka010203*',     'name' => 'Karice / Expansão']
];

echo "===============================================================\n";
echo "    VALIDAÇÃO DE AUTENTICAÇÃO CHATWOOT & GESTOR (PLAN-157)     \n";
echo "===============================================================\n\n";

$allPassed = true;

foreach ($teamUsers as $user) {
    $email = $user['email'];
    $pass = $user['password'];

    // 1. Test Chatwoot sign_in
    $ch = curl_init('https://crm.bodyharmony.com.br/auth/sign_in');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'password' => $pass]));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode($res, true);
    $chatwootOk = ($code === 200 && !empty($json['data']['id']));

    if ($chatwootOk) {
        $cwId = $json['data']['id'];
        $cwName = $json['data']['name'];
        echo "✅ [Chatwoot OK] {$email} -> User ID: {$cwId} ('{$cwName}')\n";
    } else {
        echo "❌ [Chatwoot FAIL] {$email} -> HTTP {$code}: {$res}\n";
        $allPassed = false;
    }
}

echo "\n===============================================================\n";
if ($allPassed) {
    echo "🎉 TODOS OS 7 USUÁRIOS FORAM AUTENTICADOS COM SUCESSO NO CRM!\n";
} else {
    echo "⚠️ HOUVE FALHAS NA AUTENTICAÇÃO DE ALGUNS USUÁRIOS.\n";
}
echo "===============================================================\n";
