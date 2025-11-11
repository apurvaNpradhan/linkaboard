import type { SelectLink } from "@linkaboard/db/schema/links";
import { Link } from "@tanstack/react-router";

interface LinkListProps {
	links: SelectLink[];
}
export default function LinkList({ links }: LinkListProps) {
	return (
		<div className="flex flex-col space-y-2">
			{links.map((link) => (
				<Link
					to={link.url}
					className="flex flex-row items-center rounded-sm px-2 py-1 hover:bg-primary/10"
					key={link.id}
				>
					<div className="flex flex-row items-center gap-2">
						{/*<img
              src={link.imageUrl ?? ""}
              className="h-5 w-5"
              alt={link.title}
            />*/}
						<span className="text-lg">{link.title}</span>
					</div>
				</Link>
			))}
		</div>
	);
}
