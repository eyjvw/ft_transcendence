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
			password_hash TEXT,
			google_id TEXT UNIQUE,
			auth_provider TEXT DEFAULT 'local',
			avatar_url TEXT,
			is_active INTEGER DEFAULT 0,
			a2f_secret TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
			language TEXT DEFAULT 'en',
			coins INTEGER DEFAULT 1000
		)
	`);

	// Migrations for existing tables
	const tableInfo = sqlite.prepare("PRAGMA table_info(users)").all() as any[];
	const columnNames = tableInfo.map((c: any) => c.name);

	if (!columnNames.includes("google_id")) {
		try {
			db.run("ALTER TABLE users ADD COLUMN google_id TEXT");
			db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)");
		} catch (e) {
			console.error("Migration error (google_id):", e);
		}
	}

	if (!columnNames.includes("auth_provider")) {
		try {
			db.run("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'");
		} catch (e) {
			console.error("Migration error (auth_provider):", e);
		}
	}

	if (!columnNames.includes("coins")) {
		try {
			db.run("ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 1000");
		} catch (e) {
			console.error("Migration error (coins):", e);
		}
	}

	db.run(`
		CREATE TABLE IF NOT EXISTS stats (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL REFERENCES users(id),
			points INTEGER DEFAULT 0,
			games_played INTEGER DEFAULT 0,
			games_won INTEGER DEFAULT 0,
			games_lost INTEGER DEFAULT 0,
			blackjacks_won INTEGER DEFAULT 0,
			blackjack_losses INTEGER DEFAULT 0,
			roulette_wins INTEGER DEFAULT 0,
			roulette_losses INTEGER DEFAULT 0,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS points_history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			stat_id INTEGER NOT NULL REFERENCES stats(id),
			"change" INTEGER NOT NULL,
			reason TEXT NOT NULL,
			game_type TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);
});