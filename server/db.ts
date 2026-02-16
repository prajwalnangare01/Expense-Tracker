import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// We export db, but it might throw if DATABASE_URL is not set.
// For this app, we primarily use supabase-js in storage.ts, 
// but Drizzle is useful if we have the connection string.

export const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL }) 
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;
