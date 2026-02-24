import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("/app/data/sqlite.db");
export const db = drizzle(sqlite);

db.run("PRAGMA foreign_keys = ON;");
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA synchronous = NORMAL;");
db.run("PRAGMA temp_store = MEMORY;");
db.run("PRAGMA cache_size = -20000;");
db.run("PRAGMA busy_timeout = 5000;");
db.run("PRAGMA page_size = 4096;");
db.run("PRAGMA auto_vacuum = INCREMENTAL;");

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
			language TEXT,
			coins INTEGER NOT NULL
		)
	`);
});