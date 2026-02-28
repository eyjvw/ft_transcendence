import type { Bucket } from "../../types/bucket.ts";
import type { RateLimitResult } from "../../types/ratelimit_result.ts";

function getNumber(value: string | undefined, fallback: number): number
{
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

const enabled: boolean =	(Bun.env.RATE_LIMIT_ENABLED ?? "true") !== "false";
const max: number =			Math.max(1, getNumber(Bun.env.RATE_LIMIT_MAX, 100));
const windowMs: number =	Math.max(1, getNumber(Bun.env.RATE_LIMIT_WINDOW_MS, 60_000));
const cleanupMs: number =	Math.max(1, getNumber(Bun.env.RATE_LIMIT_CLEANUP_MS, 60_000));
const maxBuckets: number =	Math.max(1000, getNumber(Bun.env.RATE_LIMIT_MAX_BUCKETS, 50_000));
const buckets: Map<string, Bucket> = new Map<string, Bucket>();

const cleanupTimer: NodeJS.Timeout = setInterval((): void => {
	const now: number = Date.now();

	for (const [key, bucket] of buckets)
	{
		if (bucket.resetAt <= now)
			buckets.delete(key);
	}

	if (buckets.size > maxBuckets)
	{
		const entries: Array<[string, Bucket]> = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt).slice(0, buckets.size - maxBuckets);

		for (const [key] of entries)
			buckets.delete(key);
	}

}, cleanupMs);

cleanupTimer.unref?.();

function normalizeClientId(value: string | null): string { return (value ?? "").split(",")[0]?.trim() || ""; };
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
	const safeKey: string =				key || "unknown";
	let bucket: Bucket | undefined =	buckets.get(safeKey);

	if (!bucket || now >= bucket.resetAt)
	{
		bucket = {
			count: 1,
			resetAt: now + windowMs
		};
		buckets.set(safeKey, bucket);
	}
	else if (bucket.count >= max)
	{
		const resetInSeconds: number = Math.ceil((bucket.resetAt - now) / 1000);

		return {
			allowed: false,
			limit: max,
			remaining: 0,
			resetInSeconds,
			retryAfterSeconds: resetInSeconds
		};
	}
	else
		++bucket.count;

	const remaining: number			= Math.max(0, max - bucket.count);
	const resetInSeconds: number	= Math.ceil((bucket.resetAt - now) / 1000);

	return {
		allowed: true,
		limit: max,
		remaining,
		resetInSeconds,
		retryAfterSeconds: 0
	};
}

export function applyRateLimitHeaders(headers: Headers,result: RateLimitResult): void
{
	headers.set("RateLimit-Limit", String(result.limit));
	headers.set("RateLimit-Remaining", String(result.remaining));
	headers.set("RateLimit-Reset", String(result.resetInSeconds));

	if (!result.allowed)
		headers.set("Retry-After", String(result.retryAfterSeconds));
}
