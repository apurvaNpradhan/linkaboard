import * as boardRepo from "@linkaboard/db/repository/board.repo";
import * as linkRepo from "@linkaboard/db/repository/link.repo";
import { InsertLink, UpdateLink } from "@linkaboard/db/schema/links";
import { generateUID } from "@linkaboard/shared";
import z from "zod";
import { protectedProcedure, router } from "..";

export const linkRouter = router({
	update: protectedProcedure
		.input(
			UpdateLink.extend({
				publicId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const linkData = await linkRepo.getLinkIdByBoardId(input.publicId);
			if (linkData) {
				const result = await linkRepo.update({
					id: linkData.id,
					userId,
					...input,
				});
				return result;
			}
		}),
	create: protectedProcedure
		.input(
			InsertLink.omit({
				publicId: true,
				createdBy: true,
			}).extend({
				boardPublicId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { url } = input;
			const userId = ctx.session.user.id;
			const { metascraper } = await import("../lib/metascraper");
			const boardData = await boardRepo.getBoardIdByBoardPublicId(
				input.boardPublicId,
			);
			try {
				const response = await fetch(url, {
					headers: { "User-Agent": "Mozilla/5.0 (compatible; linkaboard/1.0)" },
				});
				const html = await response.text();
				const resolvedUrl = response.url;
				const metadata = await metascraper({ html, url: resolvedUrl || url });
				console.log(metadata);
				const result = await linkRepo.create({
					boardId: boardData?.id,
					createdBy: userId,
					title: metadata.title ?? input.title,
					// url: resolvedUrl ?? url,
					url: url,
					description: metadata.description ?? input.description,
					imageUrl: metadata.image,
					favicon: metadata.favicon,
					domain: new URL(resolvedUrl || url).hostname,
					notes: input.notes ?? null,
					publicId: generateUID(),
				});
				return result;
			} catch (_e: any) {
				const result = await linkRepo.create({
					boardId: boardData?.id,
					createdBy: userId,
					title: input.title ?? url,
					url: url,
					description: input.description,
					imageUrl: null,
					favicon: null,
					domain: null,
					notes: null,
					publicId: generateUID(),
				});
				return result;
				// throw new TRPCError({
				//   code: "BAD_REQUEST",
				//   cause: `${e}`,
				//   message: "Error creating link",
				// });
			}
		}),
	softDelete: protectedProcedure
		.input(
			z.object({
				linkPublicId: z.string(),
				deletedAt: z.coerce.date(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const linkData = await linkRepo.getLinkIdByBoardId(input.linkPublicId);
				const userId = ctx.session.user.id;
				if (linkData) {
					const result = await linkRepo.softDelete({
						deletedAt: input.deletedAt,
						linkId: linkData.id,
						userId,
					});
					return result;
				}
			} catch (e) {
				console.log(e);
			}
		}),
});
