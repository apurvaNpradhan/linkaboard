import { UserSchema as userSchema } from "@linkaboard/api/types";
import { env } from "@linkaboard/env/web";
import {
	createCollection,
	localOnlyCollectionOptions,
} from "@tanstack/react-db";
import { createAuthClient } from "better-auth/react";
import z from "zod";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
});

type Session = typeof authClient.$Infer.Session.session;
type User = typeof authClient.$Infer.Session.user;

export const UserSchema: z.ZodType<User> = userSchema;
export const authStateSchema = z.object({
	id: z.string(),
	session: z.custom<Session>(),
	user: z.custom<User>(),
});

export const authStateCollection = createCollection(
	localOnlyCollectionOptions({
		id: "auth",
		getKey: (item) => item.id,
		schema: authStateSchema,
	}),
);
export const sessionQueryOptions = {
	queryKey: ["session"],
	queryFn: () => authClient.getSession(),
	staleTime: 5 * 60 * 1000,
};
