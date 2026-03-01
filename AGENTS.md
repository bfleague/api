# AGENTS Guide (API)

This file defines how coding agents should contribute to this `api` project.

## Goal

- Keep changes pragmatic, consistent, and low-boilerplate.
- Match existing architecture and naming patterns.
- Prefer shared utilities over repeating inline logic.

## Stack and Runtime

- Framework: NestJS 11 + TypeScript.
- Validation/serialization: `class-validator`, `class-transformer`.
- DB: MySQL via `mysql2/promise`.
- Query style: `sql-template-tag`.
- Result/error flow: `neverthrow` in services/repositories.
- API docs: Swagger generated to `docs/api/swagger.yaml`.
- Package manager: `pnpm`.

## Architecture Conventions

- `controller`:
  - HTTP contract only (routing, dto binding, HTTP exception mapping).
  - Do not put business logic in controllers.
  - Use Swagger decorators (`@ApiOperation`, response decorators) on all routes.
- `service`:
  - Business rules and orchestration.
  - Return `Result<Ok, ErrUnion>`; avoid throwing for domain flow.
- `repository`:
  - SQL access only.
  - Convert MySQL duplicate key to domain error.
  - Keep tenant filter in all queries that access tenant data.
- `common`:
  - Shared helpers/utilities belong here, not repeated in controllers.

## Error Handling Rules

- Use stable API error codes from `src/common/errors/api-error.enum.ts`.
- Use shared helpers from `src/common/errors/api-error-response.util.ts`:
  - `apiErrorPayload(...)` for thrown exception payloads.
  - `apiErrorResponse(...)` for Swagger error response schemas.
- Keep `message` human-readable and concise.
- Avoid raw string-only exceptions for mapped domain/persistence errors.

## API Contract Discipline

- Keep route, DTO, service, repository, tests, and Swagger in sync whenever an endpoint changes.
- Prefer clear resource-oriented paths and consistent conventions across modules.
- If route semantics evolve, update both e2e coverage and generated Swagger in the same change.

## Swagger and Route Docs

- Every route should have `@ApiOperation({ summary, description })`.
- Keep descriptions concise and neutral (no unnecessary tenant wording).
- After contract changes, regenerate swagger:
  - `pnpm run swagger:generate`
- CI enforces swagger parity via `swagger:check`.

## DTO and Response Conventions

- Input DTOs use strict validation rules.
- Response DTOs map API field names explicitly where needed (`@Expose`).
- Keep public response shape stable and intentional.

## DB and Migrations

- Add new migrations in `db/migrations` with timestamp prefix.
- Do not rewrite existing applied migrations.
- Use `dbmate` scripts from `package.json`.
- Keep schema and code changes shipped together.

## Testing Expectations

- Minimum checks before finishing:
  - `pnpm run lint`
  - `pnpm run build`
  - `pnpm run test:e2e:docker`
  - `pnpm run swagger:generate` (if API contract/docs changed)
- Prefer adding/updating e2e tests for route/contract changes.

## CI/CD Constraints

- CI workflow is the quality gate: format, lint, build, swagger check, tests.
- CD is ARM-targeted Docker build + GHCR push + VPS deploy.
- Keep deployment changes consistent with:
  - `.github/workflows/ci.yml`
  - `.github/workflows/cd.yml`
  - `Dockerfile`
  - `docs/deploy/*`

## Coding Style Preferences

- Avoid unnecessary boilerplate.
- If code is duplicated in more than one place, extract a shared helper.
- Prefer explicit, typed utilities over ad-hoc objects in controllers.
- Keep files focused; avoid mixing unrelated concerns.
