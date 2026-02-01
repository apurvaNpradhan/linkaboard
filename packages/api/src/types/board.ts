import {
	InsertBoardSchema,
	SelectBoardSchema,
	UpdateBoardSchema,
} from "@linkaboard/db/schema/board";
import z from "zod";

import { PinSchema } from "./pin";

export const BoardSchema = SelectBoardSchema;

export const BoardWithPinsSchema = BoardSchema.extend({
	pins: z.array(PinSchema),
});

export const InsertBoardInput = InsertBoardSchema.omit({
	parentId: true,
	position: true,
	createdBy: true,
}).extend({
	parentPublicId: z.string().optional(),
});
export const UpdateBoardInput = UpdateBoardSchema.omit({
	parentId: true,
	updatedAt: true,
	createdBy: true,
}).extend({
	publicId: z.string(),
	deletedAt: z
		.string()
		.transform((val) => new Date(val))
		.optional()
		.nullable(),
	parentPublicId: z.string().optional(),
});

export type BoardType = z.infer<typeof BoardSchema>;
export type BoardWithPinsType = z.infer<typeof BoardWithPinsSchema>;
export type InsertBoardInputType = z.infer<typeof InsertBoardInput>;
export type UpdateBoardInputType = z.infer<typeof UpdateBoardInput>;
