Bun.serve({
	fetch(req: Request, server: Bun.Server<undefined>): Response {
		try
		{
			return new Response();
		}
		catch(err: unknown)
		{
			console.error(err);
			return new Response("Internal Server Error", { status: 500 });
		}
	},
});