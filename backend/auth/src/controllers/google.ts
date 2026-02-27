import { db } from "../db/init";
import { users } from "../db/schemas/users";
import { eq } from "drizzle-orm";
import { createJWT } from "../jwt/jwt";
import { StatusCode } from "../types/status_code.ts";

export async function googleAuthController(req: Request): Promise<Response>
{
	try
	{
		const data: any = await req.json();

		if (!data || !data.credential)
			return new Response(JSON.stringify({ error: "No credential provided" }), { status: StatusCode.BAD_REQUEST });

		const googleRes: Response = await Bun.fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.credential}`);

		if (!googleRes.ok)
			return new Response(JSON.stringify({ error: "Invalid Google token" }), { status: StatusCode.UNAUTHORIZED });

		const googleData: any = await googleRes.json();
		const { sub: googleId, email, name, picture, aud } = googleData;

		if (!email)
			return new Response(JSON.stringify({ error: "Email not provided by Google" }), { status: StatusCode.BAD_REQUEST });

		if (Bun.env.GOOGLE_CLIENT_ID != aud)
			return new Response(JSON.stringify({ error: "Invalid audience" }), { status: StatusCode.UNAUTHORIZED });

		let user: any;

		try
		{
			user = await db.select().from(users).where(eq(users.google_id, googleId)).limit(1);
		}
		catch (err: unknown)
		{
			console.error(err);
			user = [];
		}

		if (user.length < 1)
		{
			try
			{
				user = await db.select().from(users).where(eq(users.email, email)).limit(1);
			} catch (err: unknown)
			{
				console.error(err);
				user = [];
			}

			if (user.length > 0)
			{
				try
				{
					await db.update(users).set({ google_id: googleId, auth_provider: "google"  }).where(eq(users.id, user[0]!.id));
					user[0]!.google_id = googleId;
					user[0]!.auth_provider = "google";
				} catch (err: unknown)
				{
					console.error(err);
					return new Response(JSON.stringify({ error: "Failed to link Google account" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
				}
			}
			else
			{
				let username: string = name || email.split("@")[0];

				try
				{
					const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);

					if (existingUsername.length > 0)
						username = `${username}_${Math.floor(Math.random() * 10000)}`;
				} catch (err: unknown)
				{
					console.error(err);
				}

				try
				{
					const [newUser] = await db.insert(users).values({
						username,
						email: email,
						google_id: googleId,
						auth_provider: "google",
						avatar_url: picture,
						is_active: 0,
						password_hash: "GOOGLE_OAUTH_ACCOUNT"
					}).returning();
					user = [newUser];
				} catch (err: unknown)
				{
					console.error(err);
					return new Response(JSON.stringify({ error: "Failed to create user" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
				}
			}
		}

		if (!user || !user[0])
			return new Response(JSON.stringify({ error: "User not found or created" }), { status: StatusCode.INTERNAL_SERVER_ERROR });

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
