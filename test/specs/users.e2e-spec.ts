import { get, json, post } from '../support/client';
import { discordIdFixture, tenantFixture } from '../fixtures';

describe('Users (e2e)', () => {
  it('rejects requests without a bearer token', async () => {
    const getResponse = await get('/users');
    expect(getResponse.status).toBe(401);

    const postResponse = await post('/users', {
      discordId: '1000',
      username: 'NoAuth',
    });
    expect(postResponse.status).toBe(401);
  });

  it('creates a user for the authenticated tenant', async () => {
    const tenant = tenantFixture('tenant-create');

    const response = await post(
      '/users',
      {
        discordId: discordIdFixture(),
        username: 'Alice',
      },
      tenant.token,
    );

    expect(response.status).toBe(201);
    expect(await json(response)).toEqual(
      expect.objectContaining({
        tenant: tenant.tenant,
        username: 'Alice',
      }),
    );
  });

  it('returns 409 when creating a duplicate discord user in the same tenant', async () => {
    const tenant = tenantFixture('tenant-dup');
    const discordId = discordIdFixture();

    const firstResponse = await post(
      '/users',
      {
        discordId,
        username: 'Alice',
      },
      tenant.token,
    );
    expect(firstResponse.status).toBe(201);

    const secondResponse = await post(
      '/users',
      {
        discordId,
        username: 'AliceAgain',
      },
      tenant.token,
    );
    expect(secondResponse.status).toBe(409);
  });

  it('isolates users by tenant', async () => {
    const tenantA = tenantFixture('tenant-a');
    const tenantB = tenantFixture('tenant-b');
    const sharedDiscordId = discordIdFixture();

    const tenantAInsert = await post(
      '/users',
      {
        discordId: sharedDiscordId,
        username: 'TenantAUser',
      },
      tenantA.token,
    );
    expect(tenantAInsert.status).toBe(201);

    const tenantBInsert = await post(
      '/users',
      {
        discordId: sharedDiscordId,
        username: 'TenantBUser',
      },
      tenantB.token,
    );
    expect(tenantBInsert.status).toBe(201);

    const tenantAUsersResponse = await get('/users', tenantA.token);
    expect(tenantAUsersResponse.status).toBe(200);
    expect(await json(tenantAUsersResponse)).toEqual([
      expect.objectContaining({
        tenant: tenantA.tenant,
        discordId: sharedDiscordId,
        username: 'TenantAUser',
      }),
    ]);

    const tenantBUsersResponse = await get('/users', tenantB.token);
    expect(tenantBUsersResponse.status).toBe(200);
    expect(await json(tenantBUsersResponse)).toEqual([
      expect.objectContaining({
        tenant: tenantB.tenant,
        discordId: sharedDiscordId,
        username: 'TenantBUser',
      }),
    ]);
  });

  it('validates the create payload', async () => {
    const tenant = tenantFixture('tenant-validate');

    const response = await post(
      '/users',
      {
        discordId: 'not-a-number',
        username: '',
      },
      tenant.token,
    );
    expect(response.status).toBe(400);
  });
});
