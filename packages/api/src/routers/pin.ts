import { PinDataSchema } from "@linkaboard/db/schema/pin";

console.log("Loaded pinRouter");

import { boardRepo } from "@linkaboard/db/repository/board.repo";
import { pinRepo } from "@linkaboard/db/repository/pin.repo";
import { env } from "@linkaboard/env/server";
import { generateKey } from "@linkaboard/shared/utils";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure } from "..";
import { InsertPinInput, UpdatePinInput } from "../types/pin";

type ScraperResponse = {
	statusCode: number;
	title: string;
	description: string;
	image: string;
	siteName: string;
	favicon: string;
};

export const pinRouter = {
	all: protectedProcedure.query(async ({ ctx }) => {
		return await pinRepo.getAll(ctx.db, { userId: ctx.session.user.id });
	}),
	update: protectedProcedure
		.input(UpdatePinInput)
		.mutation(async ({ ctx, input }) => {
			const { publicId, ...rest } = input;
			const id = await pinRepo.getIdByPublicId(ctx.db, {
				publicId,
				userId: ctx.session.user.id,
			});
			if (!id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Pin not found",
				});
			}
			return await pinRepo.update(ctx.db, {
				id: id.id,
				userId: ctx.session.user.id,
				input: {
					...rest,
					updatedAt: new Date(),
				},
			});
		}),
	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { publicId } = input;
			const id = await pinRepo.getIdByPublicId(ctx.db, {
				publicId,
				userId: ctx.session.user.id,
			});
			if (!id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Pin not found",
				});
			}
			return await pinRepo.softDelete(ctx.db, {
				id: id.id,
				userId: ctx.session.user.id,
			});
		}),
	create: protectedProcedure
		.input(InsertPinInput)
		.mutation(async ({ ctx, input }) => {
			const { boardPublicId, data } = input;
			const id = await boardRepo.getIdByPublicId(ctx.db, {
				publicId: boardPublicId,
			});
			if (!id?.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Board not found",
				});
			}

			if (data.type === "link") {
				let scraperData: Partial<ScraperResponse> = {};

				try {
					const res = await fetch(`${env.SCRAPER_URL}/v1/scraper/run`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ url: data.data.url }),
					});

					if (res.ok) {
						scraperData = (await res.json()) as ScraperResponse;
					}
				} catch (error) {
					console.error("Failed to scrape url:", error);
				}

				const parsedPinData = PinDataSchema.parse({
					type: "link",
					data: {
						url: data.data.url,
						title: scraperData.title || data.data.url,
						description: scraperData.description || "",
						imageUrl: scraperData.image || undefined,
						faviconUrl: scraperData.favicon || undefined,
					},
				});

				const lastPosition = await pinRepo.getLastPosition(ctx.db, {
					userId: ctx.session.user.id,
					boardId: id.id,
				});

				const position = generateKey(lastPosition?.position ?? null, null);

				return pinRepo.create(ctx.db, {
					input: {
						boardId: id.id,
						data: parsedPinData,
						createdBy: ctx.session.user.id,
						position,
						type: "link",
					},
				});
			}

			if (data.type === "note") {
				const lastPosition = await pinRepo.getLastPosition(ctx.db, {
					userId: ctx.session.user.id,
					boardId: id.id,
				});

				const position = generateKey(lastPosition?.position ?? null, null);

				return pinRepo.create(ctx.db, {
					input: {
						boardId: id.id,
						data: data,
						createdBy: ctx.session.user.id,
						position,
						type: "note",
					},
				});
			}

			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid pin type",
			});
		}),
};
