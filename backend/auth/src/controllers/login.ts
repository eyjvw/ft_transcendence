import { loginSchema, type LoginInput } from "../validators/auth";
import { db }							from "../db/init";
import { users }						from "../db/schemas/users";
import { compare }						from "bcrypt";
import { z, type ZodSafeParseResult }	from "zod";
import { eq, or }						from "drizzle-orm";
import { createJWT }					from "../jwt/jwt";
import { StatusCode }					from "../types/status_code.ts";
import * as errors						from "../utils/errors.ts";

export async function loginController(req: Request): Promise<Response>
{
	try
	{
		const parsed: ZodSafeParseResult<LoginInput> = loginSchema.safeParse(await req.json());

		if (!parsed.success)
			return (errors.parsing(parsed));

		const { email, password }: LoginInput = parsed.data;
		const identifier: string = email;
		const user = await db.select().from(users).where(or(eq(users.email, identifier), eq(users.username, identifier))).limit(1);

		if (user.length < 1)
			return (errors.invalidCred());

		const correctPass: boolean = await compare(password, user[0]!.password_hash);
		if (!correctPass)
			return (errors.invalidCred());
	
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
