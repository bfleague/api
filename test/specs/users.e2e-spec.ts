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

  it('returns 409 when creating a duplicate username in the same tenant', async () => {
    const tenant = tenantFixture('tenant-dup-username');
    const username = 'Alice';

    const firstResponse = await post(
      '/users',
      {
        discordId: discordIdFixture(),
        username,
      },
      tenant.token,
    );
    expect(firstResponse.status).toBe(201);

    const secondResponse = await post(
      '/users',
      {
        discordId: discordIdFixture(),
        username,
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
    expect(await json(tenantAUsersResponse)).toEqual(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            tenant: tenantA.tenant,
            discordId: sharedDiscordId,
            username: 'TenantAUser',
          }),
        ],
        pageInfo: {
          page: 1,
          pageSize: 20,
          hasNextPage: false,
        },
      }),
    );

    const tenantBUsersResponse = await get('/users', tenantB.token);
    expect(tenantBUsersResponse.status).toBe(200);
    expect(await json(tenantBUsersResponse)).toEqual(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            tenant: tenantB.tenant,
            discordId: sharedDiscordId,
            username: 'TenantBUser',
          }),
        ],
        pageInfo: {
          page: 1,
          pageSize: 20,
          hasNextPage: false,
        },
      }),
    );
  });

  it('paginates users with page query', async () => {
    const tenant = tenantFixture('tenant-pagination');

    await post(
      '/users',
      { discordId: discordIdFixture(), username: 'User1' },
      tenant.token,
    );
    await post(
      '/users',
      { discordId: discordIdFixture(), username: 'User2' },
      tenant.token,
    );
    await post(
      '/users',
      { discordId: discordIdFixture(), username: 'User3' },
      tenant.token,
    );

    const firstPageResponse = await get(
      '/users?page=1&pageSize=2',
      tenant.token,
    );
    expect(firstPageResponse.status).toBe(200);

    const firstPage = (await json(firstPageResponse)) as {
      items: Array<{ id: string }>;
      pageInfo: { page: number; pageSize: number; hasNextPage: boolean };
    };

    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.pageInfo).toEqual({
      page: 1,
      pageSize: 2,
      hasNextPage: true,
    });

    const secondPageResponse = await get(
      '/users?page=2&pageSize=2',
      tenant.token,
    );
    expect(secondPageResponse.status).toBe(200);

    const secondPage = (await json(secondPageResponse)) as {
      items: Array<{ id: string }>;
      pageInfo: { page: number; pageSize: number; hasNextPage: boolean };
    };

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.pageInfo).toEqual({
      page: 2,
      pageSize: 2,
      hasNextPage: false,
    });
    expect(firstPage.items[0].id).not.toBe(secondPage.items[0].id);
    expect(firstPage.items[1].id).not.toBe(secondPage.items[0].id);
  });

  it('validates pagination query', async () => {
    const tenant = tenantFixture('tenant-invalid-page');

    const response = await get('/users?page=0', tenant.token);
    expect(response.status).toBe(400);
  });

  it('filters users list by username', async () => {
    const tenant = tenantFixture('tenant-list-filter-username');
    const username = 'FilterUser';

    await post(
      '/users',
      {
        discordId: discordIdFixture(),
        username,
      },
      tenant.token,
    );

    await post(
      '/users',
      {
        discordId: discordIdFixture(),
        username: 'OtherUser',
      },
      tenant.token,
    );

    const response = await get(
      `/users?username=${encodeURIComponent(username)}`,
      tenant.token,
    );
    expect(response.status).toBe(200);
    expect(await json(response)).toEqual(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            username,
          }),
        ],
      }),
    );
  });

  it('gets a user by discord id', async () => {
    const tenant = tenantFixture('tenant-get-by-id');
    const discordId = discordIdFixture();
    const username = 'LookupUser';

    const createResponse = await post(
      '/users',
      {
        discordId,
        username,
      },
      tenant.token,
    );
    expect(createResponse.status).toBe(201);

    const getResponse = await get(`/users/${discordId}`, tenant.token);
    expect(getResponse.status).toBe(200);
    expect(await json(getResponse)).toEqual(
      expect.objectContaining({
        discordId,
        username,
        tenant: tenant.tenant,
      }),
    );
  });

  it('changes password and confirms credentials', async () => {
    const tenant = tenantFixture('tenant-change-password');
    const discordId = discordIdFixture();
    const username = 'PasswordUser';

    const createResponse = await post(
      '/users',
      {
        discordId,
        username,
        password: 'old-pass',
      },
      tenant.token,
    );
    expect(createResponse.status).toBe(201);

    const confirmBefore = await post(
      `/users/${discordId}/confirm`,
      {
        password: 'old-pass',
      },
      tenant.token,
    );
    expect(confirmBefore.status).toBe(200);
    expect(await json(confirmBefore)).toEqual({
      isCorrect: true,
      discordId,
    });

    const changeResponse = await post(
      `/users/${discordId}/password`,
      {
        password: 'new-pass',
      },
      tenant.token,
    );
    expect(changeResponse.status).toBe(204);

    const confirmOld = await post(
      `/users/${discordId}/confirm`,
      {
        password: 'old-pass',
      },
      tenant.token,
    );
    expect(confirmOld.status).toBe(200);
    expect(await json(confirmOld)).toEqual({
      isCorrect: false,
      discordId,
    });

    const confirmNew = await post(
      `/users/${discordId}/confirm`,
      {
        password: 'new-pass',
      },
      tenant.token,
    );
    expect(confirmNew.status).toBe(200);
    expect(await json(confirmNew)).toEqual({
      isCorrect: true,
      discordId,
    });
  });

  it('returns false on confirm when user has no password', async () => {
    const tenant = tenantFixture('tenant-confirm-no-password');
    const discordId = discordIdFixture();
    const username = 'NoPasswordUser';

    const createResponse = await post(
      '/users',
      {
        discordId,
        username,
      },
      tenant.token,
    );
    expect(createResponse.status).toBe(201);

    const confirmResponse = await post(
      `/users/${discordId}/confirm`,
      {
        password: 'any-pass',
      },
      tenant.token,
    );
    expect(confirmResponse.status).toBe(200);
    expect(await json(confirmResponse)).toEqual({
      isCorrect: false,
      discordId,
    });
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
