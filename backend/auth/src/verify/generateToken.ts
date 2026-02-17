export function generateToken(): string
{
	return Bun.randomUUIDv7() + Bun.randomUUIDv7();
}