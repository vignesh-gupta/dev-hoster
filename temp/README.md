# temp — mock database

TODO-remove-last: this directory stands in for a real database while the app is
being built. API routes read/write these JSON files through
`apps/web/lib/server/mock/*`.

- `seed/*.json` — committed starting data.
- `*.json` (next to this file) — working copies, created from `seed/` on first
  access and gitignored. Delete them to reset to the seed.
- Set `MOCK_DB_DIR` to point the store somewhere else.
