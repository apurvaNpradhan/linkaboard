import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { boardCollection } from "@/lib/collections/board";

export const Route = createFileRoute("/(authenticated)/boards/$id")({
	component: RouteComponent,
	loader: async () => {
		await boardCollection.preload();
		return null;
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data } = useLiveQuery((q) =>
		q
			.from({ board: boardCollection })
			.where(({ board }) => eq(board.publicId, id))
			.findOne(),
	);

	return (
		<div>
			<span>{data?.name}</span>
		</div>
	);
}
