import { loginSchema, type LoginInput } from "../validators/auth";
import { db } from "../db/init";
import { users } from "../db/schemas/users";
import { compare } from "bcrypt";
import { z, type ZodSafeParseResult } from "zod";
import { eq, or } from "drizzle-orm";
import { createJWT } from "../jwt/jwt";
import { StatusCode } from "../types/status_code.ts";

export async function loginController(req: Request): Promise<Response>
{
	try
	{
		const parsed: ZodSafeParseResult<LoginInput> = loginSchema.safeParse(await req.json());

		if (!parsed.success)
			return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: StatusCode.BAD_REQUEST });

		const { email, password }: LoginInput = parsed.data;
		const identifier: string = email;
		const user = await db.select().from(users).where(or(eq(users.email, identifier), eq(users.username, identifier))).limit(1);

		if (user.length < 1)
			return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: StatusCode.UNAUTHORIZED });
		const correctPass: boolean = await compare(password, user[0]!.password_hash);
	
		if (!correctPass)
			return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: StatusCode.UNAUTHORIZED });
	
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