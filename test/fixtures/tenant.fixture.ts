import { serviceToken } from '../support/client';
import { uniqueDigitsFixture } from './unique-digits.fixture';

export type TenantFixture = {
  tenant: string;
  token: string;
};

export function tenantFixture(prefix: string): TenantFixture {
  const tenant = `${prefix}-${uniqueDigitsFixture()}`;
  return {
    tenant,
    token: serviceToken(tenant),
  };
}
