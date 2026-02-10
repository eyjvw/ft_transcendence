import { SignJWT, jwtVerify, type JWTPayload, type JWTVerifyResult } from "jose";

const secret = new TextEncoder().encode(Bun.env.JWT_SECRET || "dev_only");

if (!Bun.env.JWT_SECRET) {
	console.warn("JWT_SECRET environment variable not set. Using default insecure key.");
}

export async function createJWT(uid: string): Promise<string>
{
	return await new SignJWT({ uid })
	.setProtectedHeader({ alg: "HS256" })
	.setIssuedAt()
	.setExpirationTime("7d")
	.sign(secret);
}

export async function verifyJWT(token: string): Promise<{ uid: string }>
{
	const { payload }: JWTVerifyResult<JWTPayload> = await jwtVerify(token, secret);
	return payload as { uid: string };
}