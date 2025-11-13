import type { SelectLink } from "@linkaboard/db/schema/links";
import { Link } from "@tanstack/react-router";
import { Pencil, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import EditLinkForm from "./edit-link-form";

interface LinkListProps {
	links: SelectLink[];
	handleDelete: (id: string) => void;
}
export default function LinkList({ links, handleDelete }: LinkListProps) {
	return (
		<div className="flex flex-col space-y-2">
			{links
				.filter((link) => link.id !== -1)
				.map((link) => (
					<div
						className="group flex flex-row items-center justify-between rounded-sm px-2 py-1 hover:bg-primary/10"
						key={link.id}
					>
						<Link
							to={link.url}
							target={"_blank"}
							className="flex flex-1 flex-row items-center gap-2"
						>
							<span className="text-lg">{link.title}</span>
						</Link>

						<div className="flex flex-row items-center space-x-1 opacity-0 group-hover:opacity-100">
							<Button variant={"outline"} size="none" className="p-1">
								<Tag className="h-3 w-3 text-muted-foreground" />
							</Button>
							<Sheet>
								<SheetTrigger asChild>
									<Button variant={"outline"} size="none" className="p-1">
										<Pencil className="h-3 w-3 text-muted-foreground" />
									</Button>
								</SheetTrigger>
								<SheetContent>
									<SheetHeader>
										<SheetTitle>Edit Link</SheetTitle>
										<EditLinkForm link={link} />
									</SheetHeader>
								</SheetContent>
							</Sheet>
							<Button
								variant={"outline"}
								size="none"
								className="p-1"
								onClick={async () => await handleDelete(link.publicId)}
							>
								<Trash2 className="h-3 w-3 text-muted-foreground" />
							</Button>
						</div>
					</div>
				))}
			{links
				.filter((link) => link.id === -1)
				.map((link) => {
					return (
						<div
							className="bg-primary/5 text-muted-foreground"
							key={link.publicId}
						>
							{link.url}
						</div>
					);
				})}
		</div>
	);
}
