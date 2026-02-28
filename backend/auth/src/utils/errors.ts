import { StatusCode }					from "../types/status_code.ts";
import { z, type ZodSafeParseResult }	from "zod";

const errorResponse = (errStr: string, code: number):		Response => { return (new Response(JSON.stringify({ error: errStr }), { status: code }))};

export const userTaken = (): 								Response => { return (errorResponse("Email or username already in use",	StatusCode.BAD_REQUEST));			};
export const server = (): 									Response => { return (errorResponse("Server Error",						StatusCode.INTERNAL_SERVER_ERROR));	};
export const parsing = (parsed: ZodSafeParseResult<any>):	Response => { return (errorResponse(z.treeifyError(parsed.error),		StatusCode.BAD_REQUEST));			};
export const unauthorized = (): 							Response => { return (errorResponse("Unauthorized",						StatusCode.UNAUTHORIZED));			};
export const noCookie = (): 								Response => { return (errorResponse("No Cookie",						StatusCode.BAD_REQUEST));			};
export const noUpdates = (): 								Response => { return (errorResponse("No updates",						StatusCode.BAD_REQUEST));			};
export const userNotFound = (): 							Response => { return (errorResponse("User not found",					StatusCode.NOT_FOUND));				};
export const usernameTaken = (): 							Response => { return (errorResponse("Username already in use",			StatusCode.BAD_REQUEST));			};
export const emailTaken = (): 								Response => { return (errorResponse("Email already in use",				StatusCode.BAD_REQUEST));			};
