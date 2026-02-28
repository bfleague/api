# API Deployment (ARM VPS)

This project deploys the API as a single Docker container on your VPS.

## Runtime layout

- Container name: `haxfootball-api`
- Host directory: `/opt/haxfootball-api`
- Runtime env file on VPS: `/opt/haxfootball-api/.env`
- Bound host port (localhost only): `127.0.0.1:3000`
- Public HTTPS entrypoint: Caddy reverse proxy

## Required VPS setup

1. Install Docker Engine.
2. Create the runtime directory:
   ```bash
   sudo mkdir -p /opt/haxfootball-api
   sudo chown "$USER":"$USER" /opt/haxfootball-api
   ```
3. Create `/opt/haxfootball-api/.env` with production variables:
   ```dotenv
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=mysql://user:password@db-host:3306/haxfootball

   JWT_PUBLIC_KEY=replace-me
   JWT_PRIVATE_KEY=replace-me
   JWT_ALGO=HS256
   JWT_ISS=haxfootball-api
   JWT_AUD=haxfootball-services
   JWT_EXP=15m
   ```

## Caddy reverse proxy

Use [`Caddyfile.example`](./Caddyfile.example) and replace `api.example.com`.

## GitHub environment secrets

Create a `production` environment and define:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_SSH_PORT` (optional, defaults to `22`)
- `GHCR_USERNAME` (account with `read:packages`)
- `GHCR_READ_TOKEN` (token with `read:packages`)
- `API_HOST_PORT` (optional, defaults to `3000`)

The CD workflow:

1. Builds an ARM image and pushes to GHCR.
2. Pulls the image on the VPS.
3. Runs `dbmate up` via `pnpm run db:up`.
4. Recreates the API container.
