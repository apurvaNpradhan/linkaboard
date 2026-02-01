import { zodResolver } from "@hookform/resolvers/zod";
import { InsertBoardInput } from "@linkaboard/api/types/board";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
	ResponsiveModalFooter,
	ResponsiveModalHeader,
	ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { boardCollection } from "@/lib/collections/board";
import { useModal } from "@/store/modal.store";

const formSchema = InsertBoardInput;
type FormValues = z.infer<typeof formSchema>;

interface NewBoardFormProps {
	parentPublicId: string;
}

export function NewBoardModal({ parentPublicId }: NewBoardFormProps) {
	const { close, setDirty } = useModal();

	const {
		handleSubmit,
		control,
		formState: { isDirty },
	} = useForm<FormValues>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: {},
			parentPublicId,
		},
	});

	useEffect(() => {
		setDirty(isDirty);
	}, [isDirty, setDirty]);

	const onSubmit = (data: FormValues) => {
		boardCollection.insert({
			publicId: crypto.randomUUID(),
			position: "a0",
			createdAt: new Date().toISOString(),
			updatedAt: null,
			deletedAt: null,
			description: data.description ?? null,
			name: data.name,
		});
		close();
	};

	useEffect(() => {
		const titleElement = document.querySelector<HTMLElement>("#name");
		if (titleElement) titleElement.focus();
	}, []);

	return (
		<div className="flex flex-col gap-3">
			<ResponsiveModalHeader>
				<ResponsiveModalTitle className="sr-only">
					New Board
				</ResponsiveModalTitle>
			</ResponsiveModalHeader>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="relative flex flex-col gap-3 overflow-auto"
			>
				<Controller
					control={control}
					name="name"
					render={({ field, fieldState }) => (
						<div className="space-y-1">
							<TextareaAutosize
								{...field}
								id="name"
								placeholder="Board name"
								className="w-full resize-none font-semibold text-xl outline-none placeholder:text-muted-foreground"
								onFocus={(e) =>
									e.target.scrollIntoView({
										behavior: "smooth",
										block: "center",
									})
								}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleSubmit(onSubmit)();
									}
								}}
							/>
							{fieldState.error && <FieldError errors={[fieldState.error]} />}
						</div>
					)}
				/>

				<ResponsiveModalFooter className="flex flex-row justify-end gap-3 pt-6">
					<Button type="submit" className="min-w-[120px]">
						Create board
					</Button>
				</ResponsiveModalFooter>
			</form>
		</div>
	);
}
