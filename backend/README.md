# Backend (NestJS 11)

Concise setup for the API powering the User Dashboard.

## Features
- Users CRUD with SQLite + TypeORM
- Email SHA-384 hashing and RSA-2048 signatures
- Protobuf export (`GET /users/export`)
- Validation, CORS, auto port shift if busy

## Setup
```bash
npm install
npm run start:dev
# API at http://localhost:3002 (shifts to +1 if conflict)
```

## Environment
- `PORT` – read via `@nestjs/config`. Keys generated to `keys/` on first run.

## Endpoints (high-level)
- `GET /users` · `POST /users` · `PATCH /users/:id` · `DELETE /users/:id`
- `GET /users/stats/chart` · `GET /users/stats/summary`
- `GET /users/export` (application/octet-stream; Protocol Buffers)
- `GET /crypto/public-key` (PEM for signature verification)

## Notes
- TypeORM `synchronize` is enabled for dev. Use migrations in production.
- CORS allows `http://localhost:3000` by default.

## Package Manager Guidance
Use npm. pnpm can be used if you know what you’re doing; its linking strategy can impact native deps like SQLite.
