import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	username: text("username").notNull().unique(),
	bio: text("bio"),
	email: text("email").notNull().unique(),
	password_hash: text("password_hash").notNull(),
	avatar_url: text("avatar_url"),
	is_active: integer("is_active").default(0),
	a2f_secret: text("a2f_secret"),
	created_at: text("created_at").default("CURRENT_TIMESTAMP"),
	updated_at: text("updated_at").default("CURRENT_TIMESTAMP"),
	language: text("language").default("en"),
	coins: integer("coins").default(1000)
});