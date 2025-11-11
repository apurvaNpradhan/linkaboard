import * as boardRepo from "@linkaboard/db/repository/board.repo";
import * as linkRepo from "@linkaboard/db/repository/link.repo";
import { InsertLink, links } from "@linkaboard/db/schema/links";
import { generateUID } from "@linkaboard/shared";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure, router } from "..";

export const linkRouter = router({
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
				const result = await linkRepo.create({
					boardId: boardData?.id,
					createdBy: userId,
					title: metadata.title ?? input.title,
					// url: resolvedUrl ?? url,
					url: url,
					description: metadata.description ?? input.description,
					imageUrl: metadata.image,
					favicon: metadata.favicon,
					domain: metadata.domain,
					notes: metadata.keywords,
					publicId: generateUID(),
				});
				return result;
			} catch (e: any) {
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
});
