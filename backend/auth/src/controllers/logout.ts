import { StatusCode } from "../types/status_code.ts";

export async function logoutController(): Promise<Response>
{
	return new Response(JSON.stringify({ success: true }), {
		status: StatusCode.OK,
		headers: {
			"Set-Cookie": "token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0"
		}
	});
}
