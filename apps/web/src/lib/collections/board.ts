import { BoardWithPinsSchema } from "@linkaboard/api/types/board";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";
export const boardCollection = createCollection(
	queryCollectionOptions({
		queryKey: trpc.board.all.queryKey(),
		queryClient: queryClient,
		queryFn: async () => {
			return trpcClient.board.all.query();
		},
		getKey: (item) => item.publicId,
		onInsert: async ({ transaction }) => {
			const newBoard = transaction.mutations[0].modified;
			await trpcClient.board.create.mutate(newBoard);
		},
		onUpdate: async ({ transaction }) => {
			const updatedBoard = transaction.mutations[0].modified;

			await trpcClient.board.update.mutate(updatedBoard);
		},
		onDelete: async ({ transaction }) => {
			const deletedBoard = transaction.mutations[0].modified;
			await trpcClient.board.delete.mutate(deletedBoard);
		},
	}),
);
