import { db } from "../db/init";
import { users } from "../db/schemas/users";
import { eq, or } from "drizzle-orm";
import { verifyJWT } from "../jwt/jwt";
import { StatusCode } from "../types/status_code.ts";
import { emailUpdateSchema, type EmailUpdateInput } from "../validators/auth";
import { z, type ZodSafeParseResult } from "zod";

export async function resendVerificationController(req: Request): Promise<Response>
{
	try
	{
		const cookie: string | null = req.headers.get("cookie");

		if (!cookie)
			return new Response(JSON.stringify({ error: "No Cookie" }), { status: StatusCode.BAD_REQUEST });

		const token = cookie.match(/token=([^;]+)/)?.[1];

		if (!token)
			return new Response(JSON.stringify({ error: "Unauthorized" }), { status: StatusCode.UNAUTHORIZED });

		const { uid }: Record<string, any> = await verifyJWT(token);
		const user = await db.select().from(users).where(eq(users.id, Number(uid))).limit(1);

		if (user.length < 1)
			return new Response(JSON.stringify({ error: "User not found" }), { status: StatusCode.NOT_FOUND });

		return new Response(JSON.stringify({ success: true, verified: Boolean(user[0]!.is_active) }), { status: StatusCode.OK });
	}
	catch (err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
	}
}

export async function updateEmailController(req: Request): Promise<Response>
{
	try
	{
		const cookie: string | null = req.headers.get("cookie");

		if (!cookie)
			return new Response(JSON.stringify({ error: "No Cookie" }), { status: StatusCode.BAD_REQUEST });

		const token = cookie.match(/token=([^;]+)/)?.[1];

		if (!token)
			return new Response(JSON.stringify({ error: "Unauthorized" }), { status: StatusCode.UNAUTHORIZED });

		const parsed: ZodSafeParseResult<EmailUpdateInput> = emailUpdateSchema.safeParse(await req.json());
		if (!parsed.success)
			return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: StatusCode.BAD_REQUEST });

		const { uid }: Record<string, any> = await verifyJWT(token);
		const { email }: EmailUpdateInput = parsed.data;

		const existing = await db.select().from(users).where(or(eq(users.email, email), eq(users.id, Number(uid)))).limit(1);
		
		if (existing.length > 0 && existing[0]!.id !== Number(uid))
			return new Response(JSON.stringify({ error: "Email already in use" }), { status: StatusCode.BAD_REQUEST });

		await db.update(users).set({ email, is_active: 0 }).where(eq(users.id, Number(uid)));

		const updated = await db.select().from(users).where(eq(users.id, Number(uid))).limit(1);
		if (updated.length < 1)
			return new Response(JSON.stringify({ error: "User not found" }), { status: StatusCode.NOT_FOUND });

		return new Response(JSON.stringify({
			success: true,
			user: {
				id: updated[0]!.id,
				username: updated[0]!.username,
				email: updated[0]!.email,
				avatarUrl: updated[0]!.avatar_url,
				isActive: Boolean(updated[0]!.is_active)
			}
		}), { status: StatusCode.OK });
	}
	catch (err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
	}
}
