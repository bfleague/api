import { get, json, post, put } from '../support/client';
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
        role: 'default',
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
            discord_id: sharedDiscordId,
            username: 'TenantAUser',
          }),
        ],
        page_info: {
          page: 1,
          page_size: 20,
          has_next_page: false,
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
            discord_id: sharedDiscordId,
            username: 'TenantBUser',
          }),
        ],
        page_info: {
          page: 1,
          page_size: 20,
          has_next_page: false,
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
      page_info: { page: number; page_size: number; has_next_page: boolean };
    };

    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.page_info).toEqual({
      page: 1,
      page_size: 2,
      has_next_page: true,
    });

    const secondPageResponse = await get(
      '/users?page=2&pageSize=2',
      tenant.token,
    );
    expect(secondPageResponse.status).toBe(200);

    const secondPage = (await json(secondPageResponse)) as {
      items: Array<{ id: string }>;
      page_info: { page: number; page_size: number; has_next_page: boolean };
    };

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.page_info).toEqual({
      page: 2,
      page_size: 2,
      has_next_page: false,
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
        discord_id: discordId,
        username,
        tenant: tenant.tenant,
        role: 'default',
      }),
    );
  });

  it('updates user fields with put', async () => {
    const tenant = tenantFixture('tenant-update');
    const discordId = discordIdFixture();

    const createResponse = await post(
      '/users',
      {
        discordId,
        username: 'BeforeName',
        password: 'before-pass',
      },
      tenant.token,
    );
    expect(createResponse.status).toBe(201);

    const updateResponse = await put(
      `/users/${discordId}`,
      {
        username: 'AfterName',
        role: 'mod',
        password: 'after-pass',
      },
      tenant.token,
    );

    expect(updateResponse.status).toBe(200);
    expect(await json(updateResponse)).toEqual(
      expect.objectContaining({
        discord_id: discordId,
        username: 'AfterName',
        role: 'mod',
      }),
    );

    const confirmBefore = await post(
      `/users/${discordId}/confirm`,
      {
        password: 'before-pass',
      },
      tenant.token,
    );

    expect(confirmBefore.status).toBe(200);
    expect(await json(confirmBefore)).toEqual({
      is_correct: false,
      discord_id: discordId,
    });

    const confirmAfter = await post(
      `/users/${discordId}/confirm`,
      {
        password: 'after-pass',
      },
      tenant.token,
    );

    expect(confirmAfter.status).toBe(200);
    expect(await json(confirmAfter)).toEqual({
      is_correct: true,
      discord_id: discordId,
    });
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
      is_correct: true,
      discord_id: discordId,
    });

    const changeResponse = await put(
      `/users/${discordId}`,
      {
        password: 'new-pass',
      },
      tenant.token,
    );
    expect(changeResponse.status).toBe(200);

    const confirmOld = await post(
      `/users/${discordId}/confirm`,
      {
        password: 'old-pass',
      },
      tenant.token,
    );
    expect(confirmOld.status).toBe(200);
    expect(await json(confirmOld)).toEqual({
      is_correct: false,
      discord_id: discordId,
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
      is_correct: true,
      discord_id: discordId,
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
      is_correct: false,
      discord_id: discordId,
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
