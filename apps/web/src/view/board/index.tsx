import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Container from "@/components/layout/container";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { useTRPC } from "@/utils/trpc";
import LinkList from "./components/link-list";

export default function BoardPage() {
	const { openModal } = useModal();
	const { id } = useParams({
		from: "/(authenticated)/boards/$id",
	});
	const trpc = useTRPC();
	const { data, isPending } = useQuery(
		trpc.board.byId.queryOptions(
			{
				id,
			},
			{
				enabled: !!id,
			},
		),
	);
	const handleOpen = () => {
		openModal("CREATE_LINK");
	};
	if (isPending) return <Loader />;
	if (!data) return <div>Board not found</div>;
	return (
		<Container>
			<div className="space-y-10">
				<div className="flex flex-row items-center justify-between">
					<h1 className="font-bold text-4xl">{data.name}</h1>
					<Button onClick={handleOpen}>
						<Plus />
						Add link
					</Button>
				</div>

				<LinkList links={data.links} />
			</div>
		</Container>
	);
}
