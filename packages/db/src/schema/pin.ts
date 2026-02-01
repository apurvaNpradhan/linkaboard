import {
	bigint,
	index,
	jsonb,
	pgEnum,
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
import { z } from "zod";
import { timestamps } from "../../utils/timestamps";
import type { SerializedEditorState } from "../libs/types";
import { user } from "./auth";
import { board } from "./board";

export const LinkPinDataSchema = z.object({
	url: z.url(),
	title: z.string().optional(),
	imageUrl: z.url().optional(),
	faviconUrl: z.url().optional(),
	description: z.string(),
});
export const NotePinDataSchema = z.object({
	content: z.custom<SerializedEditorState>(),
});

export const PinDataSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("link"),
		data: LinkPinDataSchema,
	}),
	z.object({
		type: z.literal("note"),
		data: NotePinDataSchema,
	}),
]);

export type PinData = z.infer<typeof PinDataSchema>;

export const pinType = ["note", "link"] as const;

export type PinType = (typeof pinType)[number];
export const pinTypeEnum = pgEnum("pin_type", pinType);

export const pin = pgTable(
	"pins",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),

		publicId: uuid("public_id")
			.notNull()
			.unique()
			.$defaultFn(() => uuidv7()),

		boardId: bigint("board_id", { mode: "bigint" })
			.notNull()
			.references(() => board.id, { onDelete: "cascade" }),

		type: pinTypeEnum("type").notNull().default("link"),

		data: jsonb("data").$type<PinData>().notNull(),

		position: varchar("position", { length: 32 }).notNull(),

		createdBy: uuid("created_by")
			.notNull()
			.references(() => user.id),

		...timestamps,
	},
	(table) => [
		index("pin_boardId_idx").on(table.boardId),
		index("pin_type_idx").on(table.type),
	],
).enableRLS();

export const SelectPinSchema = createSelectSchema(pin, {
	data: PinDataSchema,
});
export const InsertPinSchema = createInsertSchema(pin, {
	data: PinDataSchema,
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const UpdatePinSchema = createUpdateSchema(pin).omit({
	publicId: true,
	boardId: true,
	createdBy: true,
	createdAt: true,
});
