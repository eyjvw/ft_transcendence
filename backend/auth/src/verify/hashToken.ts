import { subtle } from "node:crypto";

const encoder: TextEncoder = new TextEncoder();

export async function hashToken(token: string): Promise<string>
{
	return Buffer.from(await subtle.digest("SHA-256", encoder.encode(token))).toString("hex");
}