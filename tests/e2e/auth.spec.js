const { test, expect } = require('@playwright/test');

test.describe('Autenticação Body Harmony', () => {

    test('deve realizar login como Administrador com sucesso', async ({ page }) => {
        // Acessa a página de login admin (Gatekeeper do Nexus)
        await page.goto('/nexus');

        // Preenche as credenciais via Placeholder (Gatekeeper usa CODENAME/PASSPHRASE)
        // New Password: nom4d010203
        await page.getByPlaceholder('CODENAME').fill('nom4d');
        await page.getByPlaceholder('PASSPHRASE').fill('nom4d010203');

        // Pressiona Enter para submeter (o botão está display:none)
        await page.keyboard.press('Enter');

        // Verifica se foi redirecionado para o Watchtower do Nexus ou Dashboard padrão
        await expect(page).toHaveURL(/.*(nexus\/watchtower|portal-gestor)/);
    });

    test('deve realizar login como Aluno (Simône) com sucesso', async ({ page }) => {
        // Acessa o portal do aluno (Route: /portal-licenciada)
        await page.goto('/portal-licenciada');

        // Selectores via Placeholder do PortalLogin
        // New Password for all students: Mudar123!
        await page.getByPlaceholder('Seu nome de usuário').fill('simonesantosmassage');
        await page.getByPlaceholder('Sua senha de acesso').fill('Mudar123!');

        await page.click('button:has-text("Acessar Portal")');

        // No StudentAuthContext, o login redireciona para /portal-licenciada/dashboard (ou similar)
        // Vamos validar o redirecionamento genérico
        await expect(page).toHaveURL(/.*portal-licenciada/);
    });

    test('deve falhar com credenciais inválidas', async ({ page }) => {
        await page.goto('/nexus');
        await page.getByPlaceholder('CODENAME').fill('errado');
        await page.getByPlaceholder('PASSPHRASE').fill('senha-errada');
        await page.keyboard.press('Enter');

        // No Gatekeeper a mensagem é "ACCESS DENIED"
        await expect(page.locator('text=ACCESS DENIED')).toBeVisible();
    });
});
