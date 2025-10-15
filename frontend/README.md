# Frontend (Next.js 15)

Admin dashboard UI for the User Management system.

## Features
- Users CRUD with React Query
- Signature verification via Web Crypto
- 7‑day activity chart (Recharts)
- Protobuf export decoding (protobufjs)
- Tailwind CSS, responsive layout

## Setup
```bash
npm install
npm run dev
# http://localhost:3000
```

## Environment
- `NEXT_PUBLIC_API_BASE_URL` (optional; defaults to `http://localhost:3002`)

## Notes
- Primary actions in blue, destructive in red. Consistent fixed light theme.
- Export decoding is done client‑side without extra network fetches for schema.

## Package Manager Guidance
Use npm. pnpm is fine only if you fully understand its linking/hoisting; it may break native deps indirectly (e.g., SQLite) in some setups.
