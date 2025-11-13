import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Container from "@/components/layout/container";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { queryClient } from "@/router";
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

	//Delete Link Mutation
	const deleteLinkMutation = useMutation(
		trpc.link.softDelete.mutationOptions({
			onMutate: async (args, context) => {
				queryClient.cancelQueries({
					queryKey: trpc.board.byId.queryKey({
						id,
					}),
				});

				const prevData = context.client.getQueryData(
					trpc.board.byId.queryKey({
						id,
					}),
				);
				if (prevData) {
					context.client.setQueryData(
						trpc.board.byId.queryKey({
							id,
						}),
						(old) => {
							if (!old) return prevData;
							const updatedLinks = [
								...old.links.filter((p) => p.publicId !== args.linkPublicId),
							];
							return {
								...old,
								links: updatedLinks,
							};
						},
					);
				}
				return { prevState: prevData };
			},

			onError: (_err, _newLink, context) => {
				queryClient.setQueryData(
					trpc.board.byId.queryKey({
						id,
					}),
					context?.prevState,
				);
				toast.error(_err.message);
			},
			onSuccess: (_data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.board.byId.queryKey({
						id,
					}),
				});
				toast.success("Link deleted Successfully");
			},
		}),
	);

	const handleLinkDelete = async (id: string) => {
		await deleteLinkMutation.mutateAsync({
			linkPublicId: id,
			deletedAt: new Date(),
		});
	};
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

				<LinkList links={data.links} handleDelete={handleLinkDelete} />
			</div>
		</Container>
	);
}
