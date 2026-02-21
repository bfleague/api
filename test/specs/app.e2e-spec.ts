import { get } from '../support/client';

describe('App (e2e)', () => {
  it('boots and serves HTTP', async () => {
    const response = await get('/__not-found__');
    expect(response.status).toBe(404);
  });
});
