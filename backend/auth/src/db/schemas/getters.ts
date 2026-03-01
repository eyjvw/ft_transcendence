import { db }       from "../init"
import { users }    from "./users"
import { eq }       from "drizzle-orm"

export function getUserByID(id: number)				{ return (db.select().from(users).where(eq(users.id, id)).limit(1)); }
export function getUserByEMAIL(email: string)		{ return (db.select().from(users).where(eq(users.email, email)).limit(1)); }
export function getUserByUSERNAME(username: string)	{ return (db.select().from(users).where(eq(users.username, username)).limit(1)); }
export function getUserByGOOGLEID(googleId: string)	{ return (db.select().from(users).where(eq(users.google_id, googleId)).limit(1)); }
