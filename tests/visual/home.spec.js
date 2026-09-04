const { test, expect } = require('@playwright/test');

test.describe('Identidade Visual & Mobile-First', () => {

    test('Hero Section deve manter padrão visual premium (Desktop)', async ({ page }) => {
        await page.goto('/');

        // Verifica se a seção existe
        const hero = page.locator('section').first();
        await expect(hero).toBeVisible();
    });

    test('Navbar deve ser colapsada em Mobile', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Apenas para testes mobile');

        await page.goto('/');

        // Em mobile, o botão de toggle (hamburguer) deve ser visível
        const toggle = page.locator('button >> svg').first();
        await expect(toggle).toBeVisible();
    });

    test('Consistência de Cores da Paleta V3', async ({ page }) => {
        await page.goto('/');
        const navbar = page.locator('nav').first();

        // Background da Navbar V2 é Branco
        const backgroundColor = await navbar.evaluate(el => window.getComputedStyle(el).backgroundColor);
        expect(backgroundColor).toBe('rgb(255, 255, 255)');

        // O primeiro link (Home) está ativo e é Laranja (#ED7E13 = rgb(237, 126, 19))
        // O segundo link (O Método) é Azul Escuro (#0A3E60 = rgb(10, 62, 96))
        const firstLinkColor = await page.locator('nav a').nth(0).evaluate(el => window.getComputedStyle(el).color);
        const secondLinkColor = await page.locator('nav a').nth(1).evaluate(el => window.getComputedStyle(el).color);

        expect(firstLinkColor).toBe('rgb(237, 126, 19)'); // Active Orange
        expect(secondLinkColor).toBe('rgb(10, 62, 96)'); // Primary Blue
    });
});
