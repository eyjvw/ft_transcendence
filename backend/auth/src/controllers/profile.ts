import { db }							from "../db/init.ts";
import { eq }							from "drizzle-orm";
import { users }						from "../db/schemas/users.ts";
import { verifyJWT } 					from "../jwt/jwt.ts";
import { StatusCode }					from "../types/status_code.ts";
import { updateSchema }					from "../validators/auth.ts";
import type { ZodSafeParseResult }		from "zod";
import type { UpdateInput }				from "../validators/auth.ts";
import * as querrie						from "../db/schemas/getters.ts";
import * as errors						from "../utils/errors.ts";

export async function updateProfileController(req: Request): Promise<Response>
{
	try
	{
		let		token: string | undefined;
		let		cookie: string | null;
		let		parsed: ZodSafeParseResult<UpdateInput>;

 		cookie = req.headers.get("cookie");
		if (!cookie)
			return (errors.noCookie());

		token = cookie.match(/token=([^;]+)/)?.[1];
		if (!token)
			return (errors.unauthorized());

		parsed = updateSchema.safeParse(await req.json());
		if (!parsed.success)
			return (errors.parsing(parsed));

		const updates =							parsed.data;
		const { uid }: Record<string, any> =	await verifyJWT(token);
		if (Object.keys(updates).length === 0)
			return (errors.noUpdates());

		const [existing] = await querrie.getUserByID(Number(uid));
		if (!existing)
			return (errors.userNotFound());

		if (updates.username && updates.username !== existing.username)
		{
			const nameCheck = await querrie.getUserByUSERNAME(updates.username);
			if (nameCheck.length > 0)
				return (errors.usernameTaken());
		}

		if (updates.email && updates.email !== existing.email)
		{
			const emailCheck = await querrie.getUserByEMAIL(updates.email);
			if (emailCheck.length > 0)
				return (errors.emailTaken());
			updates.is_active = 0;
		}

		await db
			.update(users)
			.set({ ...updates, updated_at: new Date().toISOString() })
			.where(eq(users.id, Number(uid)));

		const [user] = await querrie.getUserByID(Number(uid));

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
		return (errors.server());
	}
}
