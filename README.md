# Setup

This document will provide help to set up a local environment with the **database**, the **backend** and the **frontend**.

## Database

```bash
# Start a local DB, test DB and PgAdmin
# ./database
docker-compose up

# ../backend - create tables
bun i
# .env.template -> .env
#   -> set connection string based on docker-compose.yaml / services / db / environment
# .env.template -> .env.test
#   -> set connection string based on docker-compose.yaml / services/ testdb / environment
bun sql
```

### Setup PgAdmin:
- visit localhost:8080
- login:
  - email: webshop@email.com        (from docker-compose.yaml - PGADMIN_DEFAULT_EMAIL)
  - password: emailsecret           (from docker-compose.yaml - PGADMIN_DEFAULT_PASSWORD)
- add new server:
  - general
    - name: localdb                 (can be anything)
  - connection
    - host: db                      (from docker-compose.yaml - key "db" -> name of network)
    - port: 5432                    (leave default)
    - database: webshop             (from docker-compose.yaml - POSTGRES_DB)
    - username: webshopclient       (from docker-compose.yaml - POSTGRES_USER)
    - password: secret              (from docker-compose.yaml - POSTGRES_PASSWORD)
  - -> Save

### Use PgAdmin:

- Servers / localdb / webshop / Schemas / public / Tables / <any table>
  - -> right click -> View/Edit Data -> All Rows

```bash
# Stop DB when not used
# -> ctrl+c

# Reset DB - will also delete all data and tables
docker-compose down
```

## Backend

.env.template
  - -> .env
  - -> .env.test



```bash
# ./backend
bun i
bun dev

# DB - run after each update in backend/src/database/schema.ts
bun run gen   # -> create sql files based on schema.ts -> backend/sql
bun run sql   # -> execute sql (update tables)
```

## App

.env.template
  - -> .env.development
  - -> .env.production

```bash
# ./app
bun i
bun --bun run dev
# or
bun --bun run build
```

## Docs

- [Sveltekit](https://kit.svelte.dev/docs/routing)
- [Elysia](https://elysiajs.com/quick-start.html)
- [DrizzleORM](https://orm.drizzle.team/docs/overview)
- [DaisyUI](https://daisyui.com)

## Deploy

- [App](https://medium.com/@anasmohammed361/bun-with-sveltekit-benchmarks-docker-591f2cbbe61b)
- [Backend](https://elysiajs.com/integrations/docker.html)