import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { boardCollection } from "@/lib/collections/board";
import { useModal } from "@/store/modal.store";

export const Route = createFileRoute("/(authenticated)/boards/")({
	component: RouteComponent,
	loader: async () => {
		await boardCollection.preload();
		return null;
	},
});

function RouteComponent() {
	const { open } = useModal();
	return (
		<div className="flex w-full flex-col gap-4">
			<div className="flex w-full flex-row items-center justify-between">
				<span className="font-semibold text-5xl">Boards</span>
				<Button onClick={() => open({ type: "NEW_BOARD" })}>New Board</Button>
			</div>
			<BoardList />
		</div>
	);
}

function BoardList() {
	const { data } = useLiveQuery((q) =>
		q.from({ board: boardCollection }).select(({ board }) => ({
			publicId: board.publicId,
			name: board.name,
			position: board.position,
			updatedAt: board.updatedAt,
		})),
	);

	return (
		<ul>
			{data.map((board) => {
				return (
					<li key={board.publicId}>
						<Link
							disabled={board.publicId.startsWith("optimistic-")}
							to="/boards/$id"
							params={{
								id: board.publicId,
							}}
						>
							{board.name}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
