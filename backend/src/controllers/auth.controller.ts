import { registerSchema, type RegisterInput } from "../validators/auth.schema";
import { db } from "../db/init";
import { users } from "../db/schemas/users";
import bcrypt from "bcrypt";
import { startsWith, z, type ZodSafeParseResult } from "zod";
import { eq, or } from "drizzle-orm";
import { createJWT, verifyJWT } from "../jwt/auth.jwt";
import { STATUS_CODE } from "../types/status_code";

export async function registerController(req: Request): Promise<Response>
{
	try
	{
		const parsed: ZodSafeParseResult<RegisterInput> = registerSchema.safeParse(await req.json());

		if (!parsed.success)
			return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: STATUS_CODE.BAD_REQUEST });

		const { username, email, password } = parsed.data;
		const existingUser = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1);

		if (existingUser.length > 0)
			return new Response(JSON.stringify({ error: "Email or username already exists" }), { status: STATUS_CODE.BAD_REQUEST });
		
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

		return new Response(JSON.stringify({ success: true, user: newUser }), {
			status: STATUS_CODE.CREATED,
			headers: {
				"Set-Cookie": `token=${await createJWT(newUser!.id.toString()!)}; HttpOnly; Path=/; SameSite=Lax`
			}
		});
	}
	catch(err: unknown)
	{	
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: STATUS_CODE.INTERNAL_SERVER_ERROR });
	}
}

export async function loginController(req: Request): Promise<Response>
{
	try
	{
		const parsed: ZodSafeParseResult<RegisterInput> = registerSchema.safeParse(await req.json());

		if (!parsed.success)
			return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: STATUS_CODE.BAD_REQUEST });

		const { username, email, password } = parsed.data;
		const user = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1);

		if (user.length < 1)
			return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: STATUS_CODE.UNAUTHORIZED });
		const correctPass: boolean = await bcrypt.compare(password, user[0]!.password_hash);
    
		if (!correctPass)
			return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: STATUS_CODE.UNAUTHORIZED });
	
		return new Response(JSON.stringify({ success: true }), {
			status: STATUS_CODE.OK,
			headers: {
				"Set-Cookie": `token=${await createJWT(user[0]!.id.toString()!)}; HttpOnly; Path=/; SameSite=Lax`
			}
		});
	}
	catch(err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: STATUS_CODE.INTERNAL_SERVER_ERROR });
	}
}

export async function meController(req: Request): Promise<Response>
{
	try
	{
		const cookie: string | null = req.headers.get("cookie");

		if (!cookie)
			return new Response(JSON.stringify({ error: "No Cookie" }), { status: STATUS_CODE.BAD_REQUEST });

		const token = cookie.match(/token=([^;]+)/)?.[1];

		if (!token)
			return new Response(JSON.stringify({ error: "No Token" }), { status: STATUS_CODE.BAD_REQUEST });

		const { uid } = await verifyJWT(token);
		const user = await db.select().from(users).where(eq(users.id, Number(uid))).limit(1);

		if (user.length < 1)
			return new Response(JSON.stringify({ user: null }), { status: STATUS_CODE.OK });

		return new Response(JSON.stringify({ user: {
			id: user[0]!.id,
			username: user[0]!.username,
			email: user[0]!.username,
			avatarUrl: user[0]!.avatar_url,
			isActive: user[0]!.is_active
		} }), { status: STATUS_CODE.OK });

	}
	catch(err: unknown)
	{
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), { status: STATUS_CODE.INTERNAL_SERVER_ERROR });
	}
}