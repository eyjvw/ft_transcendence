import { loginController } from "./controllers/login.ts";
import { meController } from "./controllers/me.ts";
import { registerController } from "./controllers/register.ts";
import { resendVerificationController, updateEmailController } from "./controllers/verification.ts";
import { StatusCode } from "./types/status_code.ts";

const routes: Record<string, (req: Request) => Promise<Response>> = {
	"GET:/api/auth/me": meController,

	"POST:/api/auth/login": loginController,
	"POST:/api/auth/register": registerController,
	"POST:/api/auth/verify/resend": resendVerificationController,
	"PUT:/api/auth/verify/email": updateEmailController
}

const server: Bun.Server<undefined> = Bun.serve({
	port: Number(Bun.env.PORT),
	async fetch(req: Request): Promise<Response>
	{
		const handler: ((req: Request) => Promise<Response>) | undefined = routes[`${req.method}:${new URL(req.url).pathname}`];
		const response: Response = handler ? await handler(req) : new Response("Not Found", { status: StatusCode.NOT_FOUND });
		const headers: Headers = new Headers(response.headers);

		return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
	}
});

console.log(`Auth running on ${server.port}`);