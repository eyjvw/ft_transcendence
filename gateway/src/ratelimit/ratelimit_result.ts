export type RateLimitResult = {
	allowed: boolean;
	limit: number;
	remaining: number;
	resetInSeconds: number;
	retryAfterSeconds: number;
};