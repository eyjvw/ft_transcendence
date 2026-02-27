import { db } from "../db/init";
import { users } from "../db/schemas/users";
import { eq } from "drizzle-orm";
import { verifyJWT } from "../jwt/jwt";
import { StatusCode } from "../types/status_code.ts";

export async function meController(req: Request): Promise<Response>
{
	try
	{
		const cookie: string | null = req.headers.get("cookie");

		if (!cookie)
			return new Response(JSON.stringify({ error: "No Cookie" }), { status: StatusCode.BAD_REQUEST });

		const token: string | undefined = cookie.match(/token=([^;]+)/)?.[1];

		if (!token)
			return new Response(JSON.stringify({ error: "Unauthorized" }), { status: StatusCode.UNAUTHORIZED });

		const { uid }: Record<string, string> = await verifyJWT(token);
		const user = await db.select().from(users).where(eq(users.id, Number(uid))).limit(1);

		if (user.length < 1)
			return new Response(JSON.stringify("User not found"), { status: StatusCode.NOT_FOUND });

		return new Response(JSON.stringify({
			user: {
				id: user[0]!.id,
				username: user[0]!.username,
				email: user[0]!.email,
				avatarUrl: user[0]!.avatar_url,
				isActive: Boolean(user[0]!.is_active),
				language: user[0]!.language,
				coins: user[0]!.coins,
				authProvider: user[0]!.auth_provider
			}
		}), { status: StatusCode.OK });
	}
	catch(err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
	}
}