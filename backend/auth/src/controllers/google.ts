import { db }			from "../db/init";
import { users }		from "../db/schemas/users";
import { eq }			from "drizzle-orm";
import { createJWT }	from "../jwt/jwt";
import { StatusCode }	from "../types/status_code.ts";
import * as errors		from "../utils/errors.ts";
import * as queries		from "../db/schemas/getters.ts"

async function findUserByGoogleId(googleId: string): Promise<any[]>
{
	try { return await queries.getUserByGOOGLEID(googleId); }
	catch (err) { console.error(err); return []; }
}

async function findUserByEmail(email: string): Promise<any[]>
{
	try { return await queries.getUserByEMAIL(email); }
	catch (err) { console.error(err); return []; }
}

async function linkGoogleToExistingUser(user: any, googleId: string): Promise<Response | null>
{
	try
	{
		await db.update(users).set({ google_id: googleId, auth_provider: "google" }).where(eq(users.id, user.id));
		user.google_id = googleId;
		user.auth_provider = "google";
		return null;
	}
	catch (err) { console.error(err); return errors.failedLinkingAcc(); }
}

async function createGoogleUser(email: string, name: string, googleId: string, picture: string): Promise<any[] | Response>
{
	let username: string = name || email.split("@")[0];

	try
	{
		const existing = await queries.getUserByUSERNAME(username);
		if (existing.length > 0)
			username = `${username}_${Math.floor(Math.random() * 10000)}`;
	}
	catch (err) { console.error(err); }

	try
	{
		const [newUser] = await db.insert(users).values({
			username,
			email,
			google_id:		googleId,
			auth_provider:	"google",
			avatar_url:		picture,
			is_active:		0,
			password_hash:	"GOOGLE_OAUTH_ACCOUNT"
		}).returning();
		return [newUser];
	}
	catch (err) { console.error(err); return errors.failedCreatingUser(); }
}

export async function googleAuthController(req: Request): Promise<Response>
{
	try
	{
		const data: any = await req.json();
		if (!data || !data.credential)
			return (errors.noCred());

		const googleRes: Response = await Bun.fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.credential}`);
		if (!googleRes.ok)
			return (errors.invalidGoogleToken());

		const googleData: any =									await googleRes.json();
		const { sub: googleId, email, name, picture, aud } =	googleData;
		if (!email)
			return (errors.invalidGoogleEmail());
		if (Bun.env.GOOGLE_CLIENT_ID != aud)
			return (errors.invalidGoogleAud());

		let user = await findUserByGoogleId(googleId);

		if (user.length < 1)
		{
			user = await findUserByEmail(email);

			if (user.length > 0)
			{
				const linkError = await linkGoogleToExistingUser(user[0], googleId);
				if (linkError) return linkError;
			}
			else
			{
				const result = await createGoogleUser(email, name, googleId, picture);
				if (result instanceof Response) return result;
				user = result;
			}
		}

		if (!user || !user[0])
			return (errors.userNorFoundCreated());

		return new Response(JSON.stringify({ success: true }), {
			status: StatusCode.OK,
			headers: { "Set-Cookie": `token=${await createJWT(user[0]!.id.toString()!)}; HttpOnly; Path=/; SameSite=Lax` }
		});
	}
	catch(err: unknown)
	{
		console.error(err);
		return (errors.server());
	}
}
