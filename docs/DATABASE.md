# Database Schema

This scaffold runs on mocked in-memory data so it's runnable without a DB
(see `docs/STATUS.md`). Below is the schema to wire in for real persistence,
written as SQL DDL (works directly on Postgres/Supabase; port to a Prisma
`schema.prisma` if preferred — the shape is the same).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('fan', 'volunteer', 'organizer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gate_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_id TEXT NOT NULL,
  current_occupancy INTEGER NOT NULL CHECK (current_occupancy >= 0),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE operational_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  source TEXT NOT NULL CHECK (source IN ('crowd', 'chat', 'manual')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gate_readings_gate_time ON gate_readings (gate_id, recorded_at DESC);
CREATE INDEX idx_chat_turns_conversation ON chat_turns (conversation_id, created_at);
```

All application queries must be parameterized (via `pg`'s `$1, $2` binding,
Prisma, or a query builder) — never string-concatenated, per
`docs/SECURITY.md`.
