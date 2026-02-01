import {
	type AnyPgColumn,
	bigint,
	index,
	jsonb,
	pgTable,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import { timestamps } from "../../utils/timestamps";
import type { SerializedEditorState } from "../libs/types";
import { user } from "./auth";

export const board = pgTable(
	"boards",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.$defaultFn(() => uuidv7()),
		name: varchar("name", { length: 255 }).notNull(),
		description: jsonb("description").$type<SerializedEditorState>(),
		position: varchar("position", { length: 32 }).notNull(),
		parentId: bigint("parent_id", { mode: "bigint" }).references(
			(): AnyPgColumn => board.id,
		),
		createdBy: uuid("created_by")
			.notNull()
			.references(() => user.id),
		...timestamps,
	},
	(table) => [
		index("project_createdBy_idx").on(table.createdBy),
		index("project_parentId_idx").on(table.parentId),
	],
).enableRLS();

export const SelectBoardSchema = createSelectSchema(board).omit({
	id: true,
	parentId: true,
});

export const InsertBoardSchema = createInsertSchema(board).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const UpdateBoardSchema = createUpdateSchema(board).omit({
	publicId: true,
	createdAt: true,
});
