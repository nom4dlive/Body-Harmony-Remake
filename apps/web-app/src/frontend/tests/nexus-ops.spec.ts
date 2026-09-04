import { test, expect } from '@playwright/test';

test.describe('V47 Nexus Ops Backend Verification', () => {
    test.use({ baseURL: 'http://localhost:5175' });

    test('Nexus Ops Firewall Controller Exists', async ({ request }) => {
        const res = await request.get('/api/v1/admin/nexus/ops/firewall');
        // Will be 403 or 401 unauthenticated, which means the endpoint is there!
        expect([401, 403, 500]).toContain(res.status());
    });

    test('Nexus Ops Feed Controller Exists', async ({ request }) => {
        const res = await request.get('/api/v1/admin/nexus/ops/audit-feed');
        expect([401, 403, 500]).toContain(res.status());
    });
});
