import { neon } from "@neondatabase/serverless";

export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
  updatedAt: string | null;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

// Creates the table on first use so a fresh Neon database works without a separate migration step.
function ensureSchema() {
  schemaReady ??= (async () => {
    await getSql()`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        message VARCHAR(500) NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
      )
    `;
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

type EntryRow = {
  id: number;
  name: string;
  message: string;
  created_at: Date;
  updated_at: Date | null;
};

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

// password_hash is never selected here, so it can't leak into rendered pages.
export async function listEntries(): Promise<Entry[]> {
  await ensureSchema();
  const rows = (await getSql()`
    SELECT id, name, message, created_at, updated_at
    FROM entries
    ORDER BY created_at DESC, id DESC
  `) as EntryRow[];
  return rows.map(toEntry);
}

export async function insertEntry(name: string, message: string, passwordHash: string) {
  await ensureSchema();
  await getSql()`
    INSERT INTO entries (name, message, password_hash)
    VALUES (${name}, ${message}, ${passwordHash})
  `;
}

export async function getPasswordHash(id: number): Promise<string | null> {
  await ensureSchema();
  const rows = (await getSql()`
    SELECT password_hash FROM entries WHERE id = ${id}
  `) as { password_hash: string }[];
  return rows[0]?.password_hash ?? null;
}

export async function updateEntryMessage(id: number, message: string) {
  await ensureSchema();
  await getSql()`
    UPDATE entries SET message = ${message}, updated_at = now() WHERE id = ${id}
  `;
}

export async function deleteEntryById(id: number) {
  await ensureSchema();
  await getSql()`DELETE FROM entries WHERE id = ${id}`;
}
