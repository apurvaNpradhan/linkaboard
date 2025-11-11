import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Modal from "@/components/modal";
import { getUser } from "@/functions/get-user";
import { useModal } from "@/providers/modal-provider";
import NewLinkForm from "@/view/board/components/new-link-form";
import NewBoardForm from "@/view/boards/components/new-board-form";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const session = await getUser();
		if (!session) {
			throw redirect({
				to: "/sign-in",
			});
		}
	},
});

function RouteComponent() {
	const { openModal, modalContentType, isOpen } = useModal();

	const RenderModalContent = () => {
		return (
			<>
				<Modal
					isVisible={isOpen && modalContentType === "CREATE_BOARD"}
					closeOnClickOutside={true}
					dialogHeader={{
						title: "Add Board",
					}}
				>
					<NewBoardForm />
				</Modal>
				<Modal
					isVisible={isOpen && modalContentType === "CREATE_LINK"}
					closeOnClickOutside={true}
					dialogHeader={{
						title: "Add Link",
					}}
				>
					<NewLinkForm />
				</Modal>
			</>
		);
	};
	return (
		<>
			<Outlet />
			{RenderModalContent()}
		</>
	);
}
