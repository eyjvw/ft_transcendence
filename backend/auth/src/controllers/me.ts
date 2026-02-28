import { verifyJWT }	from "../jwt/jwt";
import { StatusCode }	from "../types/status_code.ts";
import * as errors		from "../utils/errors.ts"
import * as queries		from "../db/schemas/getters.ts"

export async function meController(req: Request): Promise<Response>
{
	try
	{
		const cookie: string | null = req.headers.get("cookie");

		if (!cookie)
			return (errors.noCookie());

		const token: string | undefined = cookie.match(/token=([^;]+)/)?.[1];

		if (!token)
			return (errors.unauthorized());

		const { uid }: Record<string, string> = await verifyJWT(token);
		const [user] = await queries.getUserByID(Number(uid));

		if (!user)
			return (errors.userNotFound());

		return new Response(JSON.stringify({
			user: {
				id:				user.id,
				username:		user.username,
				email:			user.email,
				avatarUrl:		user.avatar_url,
				isActive:		Boolean(user.is_active),
				language:		user.language,
				coins:			user.coins,
				authProvider:	user.auth_provider
			}
		}), { status: StatusCode.OK });
	}
	catch(err: unknown)
	{
		console.error(err);
		return (errors.server());
	}
}
