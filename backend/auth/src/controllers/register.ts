import { db }									from "../db/init";
import { users }								from "../db/schemas/users";
import { hash }									from "bcrypt";
import { eq, or }								from "drizzle-orm";
import { createJWT }							from "../jwt/jwt";
import { StatusCode }							from "../types/status_code.ts";
import { sendEmail }							from "../mailer/sendMail.ts";
import { z, type ZodSafeParseResult }			from "zod";
import { registerSchema, type RegisterInput }	from "../validators/auth";

const getResponse = (errStr: String, code: Number):				Response => { return (new Response(JSON.stringify({ error: errStr }), { status: code }))};
const serverError = (): 										Response => { return (getResponse("Server Error", StatusCode.INTERNAL_SERVER_ERROR)); };
const parsedError = (parsed: ZodSafeParseResult<RegisterInput>):	Response => { return (getResponse(z.treeifyError(parsed.error), StatusCode.BAD_REQUEST)); };
const userTaken = (): 											Response => { return (getResponse("Email or username already in use", StatusCode.BAD_REQUEST)); };

const findUser = (username: String, email: String) => { return (db.select().from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1)); };
const insertNewUser = (username: string, email: string, hashedPass: string) => { return (db.insert(users).values({ username, email, password_hash: hashedPass }).returning({ id: users.id, username: users.username, email: users.email })); };

export async function registerController(req: Request): Promise<Response>
{
	try
	{
		const parsed: ZodSafeParseResult<RegisterInput> = registerSchema.safeParse(await req.json());

		if (!parsed.success)
			return (parsedError(parsed));

		const { username, email, password }: Record<string, any> = parsed.data;
		const existingUser = await findUser(username, email);

		if (existingUser.length > 0)
			return (userTaken());

		const hashed: string = await hash(password, 10);
		const [newUser] = await insertNewUser(username, email, hashed);

		try
		{
			await sendEmail(email);
		}
		catch (err: unknown)
		{
			console.error("Erreur lors de l'envoi du mail:", err);
		}

		return (new Response(JSON.stringify({ success: true, user: newUser }), {
			status: StatusCode.CREATED,
			headers: { "Set-Cookie": `token=${await createJWT(newUser!.id.toString()!)}; HttpOnly; Path=/; SameSite=Lax` }
		}));
	}
	catch(err: unknown)
	{
		console.error(err);
		return (serverError());
	}
}
