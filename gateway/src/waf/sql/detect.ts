import { forbiddenPatterns } from "../../types/patterns";

export function detectInjection(str: string): boolean
{
	return forbiddenPatterns.some((rx: RegExp) => rx.test(str))
}