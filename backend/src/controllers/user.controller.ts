import { registerSchema, type RegisterInput } from "../validators/auth.schema";
import { db } from "../db/init";
import { users } from "../db/schemas/users";
import bcrypt from "bcrypt";
import { z, type ZodSafeParseResult } from "zod";
import { eq, or } from "drizzle-orm";

export async function registerController(req: Request): Promise<Response>
{
	try
	{
		const parsed: ZodSafeParseResult<RegisterInput> = registerSchema.safeParse(await req.json());

		if (!parsed.success)
			return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: 400 });

		const { username, email, password } = parsed.data;
		const existingUser = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1);

		if (existingUser.length > 0)
			return new Response(JSON.stringify({ error: "Email or username already exists" }), { status: 400 });
		
		const hash: string = await bcrypt.hash(password, 10);

		const [newUser]: ({ id: number; username: string; email: string; } | undefined)[] = await db.insert(users).values({
			username,
			email,
			password_hash: hash
		}).returning({
			id: users.id,
			username: users.username,
			email: users.email
		});

		return new Response(JSON.stringify({ success: true, user: newUser }), { status: 200 });
	}
	catch(err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
	}
}