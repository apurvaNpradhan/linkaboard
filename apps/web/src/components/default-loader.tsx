import { Spinner } from "./ui/spinner";

export function DefaultLoader() {
	return (
		<div className="flex items-center gap-4">
			<Spinner />
		</div>
	);
}
