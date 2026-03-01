# API Deployment (ARM VPS)

This project deploys the API as a single Docker container on your VPS.

## Runtime layout

- Container name: `haxbrasil-api`
- Host directory: `/opt/haxbrasil-api`
- Runtime env file on VPS: `/opt/haxbrasil-api/.env`
- Bound host port (localhost only): `127.0.0.1:3000`
- Public HTTPS entrypoint: Caddy reverse proxy

## Required VPS setup

1. Install Docker Engine.
2. Create the runtime directory:
   ```bash
   sudo mkdir -p /opt/haxbrasil-api
   sudo chown "$USER":"$USER" /opt/haxbrasil-api
   ```
3. Create `/opt/haxbrasil-api/.env` with production variables:

   ```dotenv
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=mysql://user:password@db-host:3306/haxbrasil

   JWT_PUBLIC_KEY=replace-me
   JWT_PRIVATE_KEY=replace-me
   JWT_ALGO=HS256
   JWT_ISS=haxbrasil-api
   JWT_AUD=haxbrasil-services
   JWT_EXP=15m
   ```

## MySQL database

MySQL runs as a Docker container on the `web` network, reachable at `db.haxbrasil.com:3306` from other containers on the same network.

### Initial setup

1. Create the data volume:
   ```bash
   docker volume create mysql-data
   ```
2. Generate a root password and start the container:

   ```bash
   MYSQL_ROOT_PASS=$(openssl rand -base64 24)
   echo "$MYSQL_ROOT_PASS" > ~/.mysql_root_password
   chmod 600 ~/.mysql_root_password

   docker run -d \
     --name mysql \
     --network web \
     --network-alias db.haxbrasil.com \
     --restart unless-stopped \
     -v mysql-data:/var/lib/mysql \
     -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASS" \
     -e MYSQL_DATABASE=haxbrasil \
     mysql:8.0
   ```

3. Create the API user:

   ```bash
   API_PASS=$(openssl rand -base64 24)
   echo "$API_PASS" > ~/.mysql_api_password
   chmod 600 ~/.mysql_api_password

   docker exec mysql mysql -uroot -p"$MYSQL_ROOT_PASS" -e "
     CREATE USER 'haxapi'@'%' IDENTIFIED BY '$API_PASS';
     GRANT ALL PRIVILEGES ON haxbrasil.* TO 'haxapi'@'%';
     FLUSH PRIVILEGES;
   "
   ```

### Connection string

Use in `.env`:

```dotenv
DATABASE_URL=mysql://haxapi:<password>@db.haxbrasil.com:3306/haxbrasil
```

> **Note:** The API container must be on the `web` Docker network (`--network web`) for `db.haxbrasil.com` to resolve via Docker DNS.

### Credentials

- Root password: `~/.mysql_root_password`
- API user password: `~/.mysql_api_password`

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
