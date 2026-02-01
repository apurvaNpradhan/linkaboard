import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { boardCollection } from "@/lib/collections/board";
import { createPinForBoard } from "@/lib/collections/pin";

export const Route = createFileRoute("/(authenticated)/boards/$id")({
	component: RouteComponent,
	loader: async () => {
		await boardCollection.preload();
		return null;
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const [url, setUrl] = useState("");
	const { data } = useLiveQuery((q) =>
		q
			.from({ board: boardCollection })
			.where(({ board }) => eq(board.publicId, id))
			.findOne(),
	);

	function createPin(e: React.FormEvent) {
		e.preventDefault();
		if (!url) return;

		createPinForBoard({
			boardPublicId: id,
			data: {
				type: "link",
				data: {
					url: url,
				},
			},
		});
		setUrl("");
	}

	return (
		<div className="mx-auto max-w-2xl p-4 font-sans">
			<div className="mb-6 flex flex-col gap-4">
				<h1 className="font-bold text-2xl">{data?.name}</h1>

				<form onSubmit={createPin} className="flex gap-2">
					<Input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="Paste a link..."
						className="flex-1"
					/>
					<Button type="submit">Create Pin</Button>
				</form>
			</div>

			<div className="flex flex-col gap-3">
				{data?.pins.map((pin) => (
					<div
						key={pin.publicId}
						className="flex items-start gap-2 rounded-lg shadow-sm transition-shadow hover:shadow-md"
					>
						{pin.data.type === "link" ? (
							<>
								{pin.data.data.faviconUrl && (
									<img
										src={pin.data.data.faviconUrl}
										alt=""
										className="h-10 w-10 rounded object-contain p-1"
									/>
								)}
								<div className="min-w-0 flex-1">
									<a
										href={pin.data.data.url}
										target="_blank"
										rel="noreferrer"
										className="block truncate font-medium text-blue-600 hover:underline"
									>
										{pin.data.data.title || pin.data.data.url}
									</a>
									<p className="mt-1 line-clamp-2 text-gray-600 text-sm">
										{pin.data.data.description}
									</p>
								</div>
							</>
						) : (
							<div className="flex-1">
								<span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-800 text-xs">
									Note
								</span>
								<div className="mt-2 text-gray-700 text-sm">Note content</div>
							</div>
						)}
					</div>
				))}

				{data?.pins.length === 0 && (
					<div className="rounded-lg border-2 border-dashed py-10 text-center text-gray-500">
						No pins yet. Click create to add one.
					</div>
				)}
			</div>
		</div>
	);
}
