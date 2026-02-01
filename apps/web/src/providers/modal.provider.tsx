import * as React from "react";
import Modal from "@/components/ui/modal";
import { NewBoardModal } from "@/features/board/components/new-board-modal";
import { type ModalType, useModal } from "@/store/modal.store";
export function ModalProvider() {
	const modal = useModal();
	// biome-ignore lint/suspicious/noExplicitAny: modal registry components have varied props
	const ModalRegistry: Record<ModalType, React.ComponentType<any>> = {
		NEW_BOARD: NewBoardModal,
		DELETE_BOARD: DeleteBoardModal,
	};
	if (modal.stack.length === 0) return null;

	return (
		<>
			{modal.stack.map((instance) => {
				const Component = ModalRegistry[instance.type];

				if (!Component) {
					console.warn(`No component found for modal type: ${instance.type}`);
					return null;
				}

				return (
					<Modal
						key={instance.id}
						modalSize={instance.modalSize}
						closeOnClickOutside={instance.closeOnClickOutside}
						isDirty={instance.isDirty}
					>
						<React.Suspense
							fallback={
								<div className="p-10 text-center text-muted-foreground">
									Loading...
								</div>
							}
						>
							<Component {...(instance.data || {})} />
						</React.Suspense>
					</Modal>
				);
			})}
		</>
	);
}

function DeleteBoardModal() {
	return <div>Delete board</div>;
}
