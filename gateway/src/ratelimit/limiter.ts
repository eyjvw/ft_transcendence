import type { Bucket } from "../types/bucket.ts";
import type { RateLimitResult } from "./ratelimit_result.ts";

function getNumber(value: string | undefined, fallback: number): number
{
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

const windowMs: number = Math.max(1, getNumber(Bun.env.RATE_LIMIT_WINDOW_MS, 60_000));
const max: number = Math.max(1, getNumber(Bun.env.RATE_LIMIT_MAX, 100));
const enabled: boolean = (Bun.env.RATE_LIMIT_ENABLED ?? "true") !== "false";
const buckets: Map<string, Bucket> = new Map();
const cleanupMs: number = Math.max(1, getNumber(Bun.env.RATE_LIMIT_CLEANUP_MS, 60_000));

const cleanupTimer: ReturnType<typeof setInterval> = setInterval(() => {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) {
			buckets.delete(key);
		}
	}
}, cleanupMs);

cleanupTimer.unref?.();

function normalizeClientId(value: string | null): string
{
	return (value ?? "").split(",")[0]?.trim() || "";
}

export function getClientId(req: Request): string
{
	return (
		normalizeClientId(req.headers.get("x-forwarded-for")) ||
		normalizeClientId(req.headers.get("x-real-ip")) ||
		normalizeClientId(req.headers.get("cf-connecting-ip")) ||
		normalizeClientId(req.headers.get("true-client-ip")) ||
		"unknown"
	);
}

export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult | null
{
	if (!enabled)
		return null;

	const safeKey: string = key || "unknown";
	let bucket: Bucket | undefined = buckets.get(safeKey);

	if (!bucket || now >= bucket.resetAt)
		bucket = { count: 0, resetAt: now + windowMs };

	bucket.count += 1;
	buckets.set(safeKey, bucket);

	const allowed: boolean = bucket.count <= max;
	const remaining: number = Math.max(0, max - bucket.count);
	const resetInSeconds: number = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
	const retryAfterSeconds: number = allowed ? 0 : resetInSeconds;

	return {
		allowed,
		limit: max,
		remaining,
		resetInSeconds,
		retryAfterSeconds
	};
}

export function applyRateLimitHeaders(headers: Headers, result: RateLimitResult): void
{
	headers.set("RateLimit-Limit", String(result.limit));
	headers.set("RateLimit-Remaining", String(result.remaining));
	headers.set("RateLimit-Reset", String(result.resetInSeconds));

	if (!result.allowed)
		headers.set("Retry-After", String(result.retryAfterSeconds));
}
