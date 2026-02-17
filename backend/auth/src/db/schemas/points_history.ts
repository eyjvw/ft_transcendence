import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { stats } from "./stats";

export const points_history = sqliteTable("points_history", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	stat_id: integer("stat_id").notNull().references(() => stats.id),
	change: integer("change").notNull(),
	reason: text("reason").notNull(),
	game_type: text("game_type"),
	created_at: text("created_at").default("CURRENT_TIMESTAMP")
});
