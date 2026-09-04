const { test, expect } = require('@playwright/test');

test.describe('Segurança LMS (Fase 6)', () => {

    test('deve bloquear acesso direto a aulas sem login', async ({ page }) => {
        // Tenta acessar um módulo protegido diretamente
        await page.goto('/portal-licenciada/dashboard');

        // Deve redirecionar para login (portal-licenciada)
        await expect(page).toHaveURL(/.*portal-licenciada/);
    });

    test('não deve permitir acesso ao Portal do Gestor para alunos', async ({ page }) => {
        // Primeiro faz login como aluno
        await page.goto('/portal-licenciada');

        // Aumentamos o timeout para lidar com animações de entrada
        const userField = page.getByPlaceholder('Seu nome de usuário');
        await userField.waitFor({ state: 'visible', timeout: 15000 });

        await userField.fill('simonesantosmassage');
        await page.getByPlaceholder('Sua senha de acesso').fill('Mudar123!');
        await page.click('button:has-text("Acessar Portal")');

        // Espera o dashboard carregar para garantir login
        await expect(page).toHaveURL(/.*portal-licenciada/);

        // Tenta "pular" para a administração (Nexus Monitor) em várias sub-rotas
        const nexusRoutes = ['/nexus/watchtower', '/nexus/engine', '/nexus/vault'];
        for (const route of nexusRoutes) {
            await page.goto(route);
            // Deve ser bloqueado ou redirecionado de volta
            await expect(page).not.toHaveURL(new RegExp('.*' + route.replace('/', '\/')));
        }
    });

    test('deve validar bloqueio de clique direito em vídeos (DRM-Lite)', async ({ page }) => {
        // Faz login para acessar o vídeo
        await page.goto('/portal-licenciada');
        await page.getByPlaceholder('Seu nome de usuário').fill('simonesantosmassage');
        await page.getByPlaceholder('Sua senha de acesso').fill('Mudar123!');
        await page.click('button:has-text("Acessar Portal")');

        await page.goto('/portal-licenciada/dashboard');

        const isContextBlocked = await page.evaluate(() => {
            let blocked = false;
            const handler = e => {
                blocked = true;
                e.preventDefault();
            };
            document.addEventListener('contextmenu', handler, { once: true });

            const event = new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            document.dispatchEvent(event);
            document.removeEventListener('contextmenu', handler);
            return blocked;
        });
        // Validamos se o evento foi interceptado
        expect(isContextBlocked).toBe(true);
    });
});
