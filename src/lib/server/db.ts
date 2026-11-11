import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// This file is server-only. Import it from Netlify Functions, never from React UI code.
const url = process.env.TURSO_DATABASE_URL ?? 'file:./database/prodash.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
   url,
   ...(authToken ? { authToken } : {}),
});

export const db = drizzle(client);
