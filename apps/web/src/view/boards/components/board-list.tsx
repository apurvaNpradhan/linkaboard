import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Box, Hash } from "lucide-react";
import Loader from "@/components/loader";
import { useTRPC } from "@/utils/trpc";

export default function BoardList() {
	const trpc = useTRPC();
	const { data, isPending } = useQuery(trpc.board.all.queryOptions());
	if (isPending) return <Loader />;
	if (data?.length === 0) {
		return <span>No Boards</span>;
	}

	return (
		<div className="flex flex-col space-y-2">
			<div className="flex flex-col border-b pb-2">
				<span className="font-semibold text-lg">{data?.length} board</span>
			</div>
			{data?.map((board) => (
				<Link
					to={"/boards/$id"}
					params={{
						id: board.publicId,
					}}
					key={board.publicId}
					className="group flex flex-row items-center rounded-sm px-2 py-1 hover:bg-primary/10"
				>
					<div className="flex flex-row items-center gap-4">
						<Box
							className="h-5 w-5"
							style={{
								color: board.color,
							}}
						/>
						<span className="text-lg">{board.name}</span>
					</div>
				</Link>
			))}
		</div>
	);
}
