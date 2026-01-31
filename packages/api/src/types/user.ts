import {
	SelectAccountSchema,
	SelectUserSchema,
} from "@linkaboard/db/schema/auth";
import type z from "zod";

export const UserSchema = SelectUserSchema;
export const AccountSchema = SelectAccountSchema;

export type User = z.infer<typeof UserSchema>;
export type Account = z.infer<typeof AccountSchema>;
