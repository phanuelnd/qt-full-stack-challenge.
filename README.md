# User Dashboard Management System (NestJS + Next.js)

Production-ready full-stack project: NestJS 11 backend (SQLite/TypeORM, crypto, protobuf) and Next.js 15 frontend (React Query, Tailwind, charts).

## Structure
- `backend/` — NestJS API (users CRUD, RSA signatures, SHA-384 email hashing, protobuf export)
- `frontend/` — Next.js admin UI (user CRUD, signature verification, charts, protobuf decode)

## Prerequisites
- Node.js 20+ and npm 10+
- SQLite (bundled, no server to run)

## Quick Start
```bash
# Install dependencies
cd backend && npm install && cd ../frontend && npm install

# Start backend (http://localhost:3002)
cd ../backend
npm run start:dev

# Start frontend (http://localhost:3000)
cd ../frontend
npm run dev
```

## Notes
- RSA-2048 keys are generated to `backend/keys/` on first run.
- Emails are hashed via SHA-384 and signed; frontend verifies with Web Crypto.
- `/users/export` returns binary Protocol Buffers for efficient transport.

## Package Manager Guidance
Use npm for all commands. pnpm should be used only if you fully understand its symlink/hoist strategy; it can break native deps like SQLite in some environments.

## Scripts
- Backend: `npm run start:dev`, `npm run build`, `npm run test`
- Frontend: `npm run dev`, `npm run build`, `npm run start`
