import { InsertBoard } from "@linkaboard/db/schema/boards";
import { COLORS } from "@linkaboard/shared/constants";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import type * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/providers/modal-provider";
import { useTRPC } from "@/utils/trpc";

export default function NewBoardForm() {
	const { closeModal } = useModal();
	const trpc = useTRPC();
	const navigate = useNavigate();

	const { data: boardsData, refetch: refetchBoards } = useQuery(
		trpc.board.all.queryOptions(),
	);

	const createMutation = useMutation(
		trpc.board.create.mutationOptions({
			onSuccess: async (board) => {
				if (!board) {
					toast.error("Failed to create board");
					return;
				}

				await refetchBoards();
				navigate({
					to: "/boards/$id",
					params: { id: board.id.toString() },
				});
				closeModal();
			},
			onError: (err) => {
				toast.error(err.message);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			name: "",
			color: COLORS[0],
			description: "",
		} as z.input<typeof InsertBoard>,
		validators: {
			onDynamic: InsertBoard,
			onDynamicAsyncDebounceMs: 300,
		},
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync(value);
		},
		onSubmitInvalid: ({ formApi }) => {
			const errorMap = formApi.state.errorMap.onDynamic;
			const firstErrorField = Object.keys(errorMap || {}).find(
				(name) => errorMap?.[name],
			);
			if (firstErrorField) {
				const input = document.querySelector(
					`input[name="${firstErrorField}"], button[name="${firstErrorField}"]`,
				) as HTMLInputElement | HTMLButtonElement | null;
				input?.focus();
			}
		},
	});

	useEffect(() => {
		const titleElement = document.querySelector<HTMLElement>("#name-input");
		titleElement?.focus();
	}, []);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex h-full flex-col"
		>
			<div className="flex-1 space-y-6 overflow-y-auto p-6">
				<div className="space-y-2">
					<form.Field name="name">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Input
									id="name-input"
									name={field.name}
									placeholder="Name"
									type="text"
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={!!field.state.meta.errors.length}
								/>
								{field.state.meta.errors.map((error, i) => (
									<p
										key={error?.message}
										className="mt-1 text-destructive text-sm"
									>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div className="space-y-3">
					<Label className="font-medium text-sm">Board Color</Label>
					<form.Field name="color">
						{(field) => (
							<div className="flex flex-wrap gap-2">
								{COLORS.map((c) => (
									<button
										key={c}
										type="button"
										name={field.name}
										className="relative h-8 w-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
										style={{ backgroundColor: c }}
										onClick={() => field.handleChange(c)}
										aria-pressed={field.state.value === c}
									>
										{field.state.value === c && (
											<div className="absolute inset-0 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background" />
										)}
									</button>
								))}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			<div className="flex justify-end gap-2 border-t px-6 py-4">
				<form.Subscribe
					selector={(state) => ({
						isSubmitting: state.isSubmitting,
						canSubmit: state.canSubmit,
						values: state.values,
					})}
				>
					{({ isSubmitting, canSubmit, values }) => (
						<>
							<Button
								variant="secondary"
								onClick={() => {
									closeModal();
									form.reset();
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								disabled={isSubmitting || !canSubmit || !values.name.trim()}
							>
								{isSubmitting ? (
									<>
										<Spinner />
										Creating
									</>
								) : (
									"create"
								)}
							</Button>
						</>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
