import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const stats = sqliteTable("stats", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	user_id: integer("user_id").notNull().references(() => users.id),
	points: integer("points").default(0),
	games_played: integer("games_played").default(0),
	games_won: integer("games_won").default(0),
	games_lost: integer("games_lost").default(0),
	blackjacks_won: integer("blackjacks_won").default(0),
	blackjack_losses: integer("blackjack_losses").default(0),
	roulette_wins: integer("roulette_wins").default(0),
	roulette_losses: integer("roulette_losses").default(0),
	created_at: text("created_at").default("CURRENT_TIMESTAMP"),
	updated_at: text("updated_at").default("CURRENT_TIMESTAMP")
});
	