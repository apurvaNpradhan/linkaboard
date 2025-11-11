import { cn } from "@/lib/utils";
import { useModal } from "@/providers/modal-provider";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";

interface Props {
	children: React.ReactNode;
	modalSize?: "sm" | "md" | "lg";
	dialogHeader?: {
		title: string;
		description?: string;
	};
	positionFromTop?: "sm" | "md" | "lg" | "none";
	isVisible?: boolean;
	closeOnClickOutside?: boolean;
}

const Modal: React.FC<Props> = ({
	children,
	closeOnClickOutside,
	dialogHeader = {
		title: "",
		description: "",
	},
	isVisible,
	modalSize = "sm",
	positionFromTop = "none",
}) => {
	const {
		isOpen,
		closeModal,
		closeOnClickOutside: modalCloseOnClickOutside,
	} = useModal();

	const shouldShow = isVisible ?? isOpen;
	const shouldCloseOnClickOutside =
		closeOnClickOutside ?? modalCloseOnClickOutside;

	const modalSizeMap = {
		sm: "max-w-[400px]",
		md: "max-w-[550px]",
		lg: "max-w-[800px]",
	};

	const positionFromTopMap = {
		none: "",
		sm: "mt-[12vh]",
		md: "mt-[25vh]",
		lg: "mt-[50vh]",
	};
	return (
		<div className={cn(!shouldShow && "hidden")}>
			<Dialog
				open={shouldShow}
				onOpenChange={shouldCloseOnClickOutside ? closeModal : () => null}
			>
				<DialogContent
					className={cn(
						positionFromTopMap[positionFromTop],
						modalSizeMap[modalSize],
					)}
				>
					<DialogHeader>
						<DialogTitle>{dialogHeader.title}</DialogTitle>
						<DialogDescription>{dialogHeader.description}</DialogDescription>
					</DialogHeader>
					{children}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Modal;
