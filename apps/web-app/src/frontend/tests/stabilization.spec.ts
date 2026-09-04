import { test, expect } from '@playwright/test';

test.describe('Body Harmony Stabilization Verification', () => {
    // Note: This test assumes the dev server is running and we can potentially skip login if tokens are in localStorage
    // For this environment, we will mostly check for response status codes via manual request injection if possible,
    // or just simulate a visit to protected pages and check for 401 redirects.

    test('Verification of Profile Update Endpoint', async ({ request }) => {
        // We simulate a request with a dummy token or valid structure to see if it gives 404 (wrong route) or 401 (auth issue)
        // 401 is EXPECTED if no token, 404 is the BUG we are fixing.
        const response = await request.put('/api/v1/auth/licenciada/profile', {
            data: { name: 'Test' }
        });
        expect(response.status()).not.toBe(404);
    });

    test('Verification of LGPD Status Endpoint', async ({ request }) => {
        const response = await request.get('/api/v1/lgpd/status');
        expect(response.status()).not.toBe(404);

        if (response.status() === 200) {
            const data = await response.json();
            expect(data).toHaveProperty('terms');
            expect(data).toHaveProperty('privacy');
        }
    });

    test('Verification of Nexus Dashboard Routes', async ({ request }) => {
        const response = await request.get('/api/v1/admin/nexus/system-status');
        expect(response.status()).not.toBe(404);
    });
});
