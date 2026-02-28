import { db }							from "../db/init.ts";
import { eq }							from "drizzle-orm";
import { users }						from "../db/schemas/users.ts";
import { verifyJWT } 					from "../jwt/jwt.ts";
import { StatusCode }					from "../types/status_code.ts";
import { updateSchema }					from "../validators/auth.ts";
import { z, type ZodSafeParseResult }	from "zod";
import type { UpdateInput }				from "../validators/auth.ts";

const getResponse = (errStr: String, code: Number): 			Response => { return (new Response(JSON.stringify({ error: errStr }), { status: code }))};
const serverError = (): 										Response => { return (getResponse("Server Error", StatusCode.INTERNAL_SERVER_ERROR)); };
const unAuthorized = (): 										Response => { return (getResponse("Unauthorized", StatusCode.UNAUTHORIZED)); };
const noCookie = (): 											Response => { return (getResponse("No Cookie", StatusCode.BAD_REQUEST)); };
const parsedError = (parsed: ZodSafeParseResult<UpdateInput>):	Response => { return (getResponse(z.treeifyError(parsed.error), StatusCode.BAD_REQUEST)); };
const noUpdates = (): 											Response => { return (getResponse("No updates", StatusCode.BAD_REQUEST)); };
const userNotFound = (): 										Response => { return (getResponse("User not found", StatusCode.NOT_FOUND)); };
const usernameTaken = (): 										Response => { return (getResponse("Username already in use", StatusCode.BAD_REQUEST)); };
const emailTaken = (): 											Response => { return (getResponse("Email already in use", StatusCode.BAD_REQUEST)); };

const findByID =	(uid: Number)		=> { return (db.select().from(users).where(eq(users.id, uid)).limit(1)); };
const findByEMAIL =	(email: String)		=> { return (db.select().from(users).where(eq(users.email, email)).limit(1)); };
const findByUSER =	(username: String)	=> { return (db.select().from(users).where(eq(users.username, username)).limit(1)); };

export async function updateProfileController(req: Request): Promise<Response>
{
	try
	{
		let		token: string | undefined;
		let		cookie: string | null;
		let		parsed: ZodSafeParseResult<UpdateInput>;

 		cookie = req.headers.get("cookie");
		if (!cookie)
			return (noCookie());

		token = cookie.match(/token=([^;]+)/)?.[1];
		if (!token)
			return (unAuthorized());

		parsed = updateSchema.safeParse(await req.json());
		if (!parsed.success)
			return (parsedError(parsed));

		const updates =							parsed.data;
		const { uid }: Record<string, any> =	await verifyJWT(token);
		if (Object.keys(updates).length === 0)
			return (noUpdates());

		const [existing] = await findByID(Number(uid));
		if (!existing)
			return (userNotFound());

		if (updates.username && updates.username !== existing.username)
		{
			const nameCheck = await findByUSER(updates.username);
			if (nameCheck.length > 0)
				return (usernameTaken());
		}

		if (updates.email && updates.email !== existing.email)
		{
			const emailCheck = await findByEMAIL(updates.email);
			if (emailCheck.length > 0)
				return (emailTaken());
			updates.is_active = 0;
		}

		await db
			.update(users)
			.set({ ...updates, updated_at: new Date().toISOString() })
			.where(eq(users.id, Number(uid)));

		const [user] = await findByID(Number(uid));

		return new Response(JSON.stringify({
			success: true,
			user: {
				id:			user!.id,
				username:	user!.username,
				email:		user!.email,
				avatarUrl:	user!.avatar_url,
				isActive:	Boolean(user!.is_active),
				language:	user!.language,
				coins:		user!.coins
			}
		}), { status: StatusCode.OK });
	}
	catch(err: unknown)
	{
		console.error(err);
		return (serverError());
	}
}