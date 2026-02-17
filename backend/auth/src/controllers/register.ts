import { registerSchema, type RegisterInput } from "../validators/auth";
import { db } from "../db/init";
import { users } from "../db/schemas/users";
import { hash } from "bcrypt";
import { z, type ZodSafeParseResult } from "zod";
import { eq, or } from "drizzle-orm";
import { createJWT } from "../jwt/jwt";
import { StatusCode } from "../types/status_code.ts";

export async function registerController(req: Request): Promise<Response>
{
	try
	{
		const parsed: ZodSafeParseResult<RegisterInput> = registerSchema.safeParse(await req.json());

		if (!parsed.success)
			return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: StatusCode.BAD_REQUEST });

		const { username, email, password }: Record<string, any> = parsed.data;
		const existingUser = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1);

		if (existingUser.length > 0)
			return new Response(JSON.stringify({ error: "Email or username already exists" }), { status: StatusCode.BAD_REQUEST });
		
		const hashed: string = await hash(password, 10);
		const [newUser]: ({ id: number; username: string; email: string; } | undefined)[] = await db.insert(users).values({ username, email, password_hash: hashed }).returning({ id: users.id, username: users.username, email: users.email });

		return new Response(JSON.stringify({ success: true, user: newUser }), {
			status: StatusCode.CREATED,
			headers: {
				"Set-Cookie": `token=${await createJWT(newUser!.id.toString()!)}; HttpOnly; Path=/; SameSite=Lax`
			}
		});
	}
	catch(err: unknown)
	{	
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: StatusCode.INTERNAL_SERVER_ERROR });
	}
}