import { auth } from "@linkaboard/auth";
import { db } from "@linkaboard/db";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});
	return {
		db,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
