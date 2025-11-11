import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/providers/modal-provider";
import BoardList from "./components/board-list";

export default function BoardsPage() {
	const { openModal } = useModal();
	const openCreateModal = () => {
		openModal("CREATE_BOARD");
	};
	return (
		<div className="space-y-10">
			<h1 className="font-bold text-4xl">My Boards</h1>
			<div className="mt-10 flex flex-col space-y-5">
				<Input placeholder="Search projects" />
				<div className="flex flex-row items-center justify-between">
					<span>Archived projects only</span>
					<Button size={"lg"} variant={"outline"} onClick={openCreateModal}>
						<Plus className="h-4 w-4" />
						Add
					</Button>
				</div>
			</div>
			<BoardList />
		</div>
	);
}
