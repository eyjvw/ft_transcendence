import { db } from "../db/init.ts";
import { users } from "../db/schemas/users.ts";
import { eq } from "drizzle-orm";
import { verifyJWT } from "../jwt/jwt.ts";
import { StatusCode } from "../types/status_code.ts";
import { updateSchema } from "../validators/auth.ts";
import { z, type ZodSafeParseResult } from "zod";

import type { UpdateInput } from "../validators/auth.ts";

export async function updateProfileController(req: Request): Promise<Response>
{
	try
	{
		const cookie: string | null = req.headers.get("cookie");

		if (!cookie)
			return new Response(JSON.stringify({ error: "No Cookie" }), { status: StatusCode.BAD_REQUEST });

		const token = cookie.match(/token=([^;]+)/)?.[1];

		if (!token)
			return new Response(JSON.stringify({ error: "Unauthorized" }), { status: StatusCode.UNAUTHORIZED });

		const parsed: ZodSafeParseResult<UpdateInput> = updateSchema.safeParse(await req.json());

		if (!parsed.success)
			return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: StatusCode.BAD_REQUEST });

		const { uid }: Record<string, any> = await verifyJWT(token);
		const updates = parsed.data;

		if (Object.keys(updates).length === 0)
			return new Response(JSON.stringify({ error: "No updates" }), { status: StatusCode.BAD_REQUEST });

		const existing = await db.select().from(users).where(eq(users.id, Number(uid))).limit(1);
		if (existing.length < 1)
			return new Response(JSON.stringify({ error: "User not found" }), { status: StatusCode.NOT_FOUND });

		if (updates.username && updates.username !== existing[0]!.username)
		{
			const nameCheck = await db.select().from(users).where(eq(users.username, updates.username)).limit(1);
			if (nameCheck.length > 0)
				return new Response(JSON.stringify({ error: "Username already in use" }), { status: StatusCode.BAD_REQUEST });
		}

		if (updates.email && updates.email !== existing[0]!.email)
		{
			const emailCheck = await db.select().from(users).where(eq(users.email, updates.email)).limit(1);
			if (emailCheck.length > 0)
				return new Response(JSON.stringify({ error: "Email already in use" }), { status: StatusCode.BAD_REQUEST });
			updates.is_active = 0;
		}

		await db.update(users)
			.set({
				...updates,
				updated_at: new Date().toISOString()
			})
			.where(eq(users.id, Number(uid)));

		const updated = await db.select().from(users).where(eq(users.id, Number(uid))).limit(1);

		return new Response(JSON.stringify({
			success: true,
			user: {
				id: updated[0]!.id,
				username: updated[0]!.username,
				email: updated[0]!.email,
				avatarUrl: updated[0]!.avatar_url,
				isActive: Boolean(updated[0]!.is_active),
				language: updated[0]!.language,
				coins: updated[0]!.coins
			}
		}), { status: StatusCode.OK });
	}
	catch(err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
	}
}
