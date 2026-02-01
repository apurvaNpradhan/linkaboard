import { relations } from "drizzle-orm";
import { account, session, user } from "./auth";
import { board } from "./board";
import { pin } from "./pin";

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	boards: many(board),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));
export const boardRelations = relations(board, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [board.createdBy],
		references: [user.id],
	}),
	parent: one(board, {
		fields: [board.parentId],
		references: [board.id],
		relationName: "boardParent",
	}),
	children: many(board, {
		relationName: "projectParent",
	}),
	pins: many(pin),
}));

export const pinRelations = relations(pin, ({ one, many }) => ({
	board: one(board, {
		fields: [pin.boardId],
		references: [board.id],
	}),
}));
