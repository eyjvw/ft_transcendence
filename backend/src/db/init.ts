import { Database } from "bun:sqlite";

const db: Database = new Database("/app/data/db.sqlite");

db.transaction((): void => {
	db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL unique,
		password_hash TEXT NOT NULL 
		is_active INTEGER DEFAULT 0,
		a2f_secret TEXT,
		avatar_url TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		update_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
})();
