import { db } from "../db/init";
import { users } from "../db/schemas/users";
import { eq } from "drizzle-orm";
import { createJWT } from "../jwt/jwt";
import { StatusCode } from "../types/status_code.ts";

export async function googleAuthController(req: Request): Promise<Response>
{
	try
	{
		const { credential } = await req.json();

		if (!credential)
			return new Response(JSON.stringify({ error: "No credential provided" }), { status: StatusCode.BAD_REQUEST });

		const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
		if (!googleRes.ok)
			return new Response(JSON.stringify({ error: "Invalid Google token" }), { status: StatusCode.UNAUTHORIZED });

		const googleData = await googleRes.json();
		const { sub: googleId, email, name, picture } = googleData;

		// Check if user exists by google_id
		let user = await db.select().from(users).where(eq(users.google_id, googleId)).limit(1);

		if (user.length < 1) {
			// Check if user exists by email
			user = await db.select().from(users).where(eq(users.email, email)).limit(1);

			if (user.length > 0) {
				// Link Google to existing account
				await db.update(users).set({ 
					google_id: googleId,
					auth_provider: "google" 
				}).where(eq(users.id, user[0].id));
				user[0].google_id = googleId;
				user[0].auth_provider = "google";
			} else {
				// Create new user
				let username = name || email.split("@")[0];
				
				// Check if username exists
				const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
				if (existingUsername.length > 0) {
					username = `${username}_${Math.floor(Math.random() * 10000)}`;
				}

				const [newUser] = await db.insert(users).values({
					username,
					email: email,
					google_id: googleId,
					auth_provider: "google",
					avatar_url: picture,
					is_active: 1 // Google users are pre-verified
				}).returning();
				user = [newUser];
			}
		}

		return new Response(JSON.stringify({ success: true }), {
			status: StatusCode.OK,
			headers: {
				"Set-Cookie": `token=${await createJWT(user[0]!.id.toString()!)}; HttpOnly; Path=/; SameSite=Lax`
			}
		});
	}
	catch(err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
	}
}
