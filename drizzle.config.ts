import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'sqlite',
   schema: './src/lib/server/schema.ts',
   out: './drizzle',
   driver: 'libsql',
   dbCredentials: {
      url: process.env.TURSO_DATABASE_URL ?? 'file:./database/prodash.sqlite',
      ...(process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {}),
   },
});
