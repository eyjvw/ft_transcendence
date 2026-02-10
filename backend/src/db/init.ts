import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("/app/data/sqlite.db");
export const db = drizzle(sqlite);

db.run("PRAGMA foreign_keys = ON;");

db.transaction((): void => {
	db.run(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			bio TEXT,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			avatar_url TEXT,
			is_active INTEGER,
			a2f_secret TEXT,
			created_at TEXT,
			updated_at TEXT,
			language TEXT
		)
	`);
});