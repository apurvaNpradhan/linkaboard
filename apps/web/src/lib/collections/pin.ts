import type { PinInput } from "@linkaboard/api/types/pin";
import { createCollection, createOptimisticAction } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";
import { boardCollection } from "./board";

export const pinCollection = createCollection(
	queryCollectionOptions({
		queryKey: trpc.pin.all.queryKey(),
		syncMode: "on-demand",
		queryClient: queryClient,
		queryFn: async () => {
			return trpcClient.pin.all.query();
		},
		getKey: (item) => item.publicId,
	}),
);

export const createPinForBoard = createOptimisticAction<PinInput>({
	onMutate: (input) => {
		boardCollection.update(input.boardPublicId, (draft) => {
			const draftData =
				input.data.type === "link"
					? {
							type: "link" as const,
							data: {
								url: input.data.data.url,
								title: input.data.data.url,
								description: "Loading...",
								imageUrl: "https://placehold.co/400",
								faviconUrl: "https://placehold.co/400",
							},
						}
					: {
							type: "note" as const,
							data: input.data.data,
						};
			draft.pins.push({
				position: "a0",
				publicId: crypto.randomUUID(),
				type: input.data.type,
				data: draftData,
				updatedAt: new Date().toISOString(),
			});
		});
	},
	mutationFn: async (input) => {
		const response = await trpcClient.pin.create.mutate(input);
		await Promise.all([boardCollection.utils.refetch()]);
		return response;
	},
});
