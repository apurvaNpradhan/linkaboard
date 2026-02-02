import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import type { SerializedEditorState } from "lexical";
import { Editor } from "@/components/editor/editors/content-editor/editor";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
	initialContent?: SerializedEditorState;
	className?: string;
	placeholder?: string;
	onUpdate?: (content: SerializedEditorState) => void;
}

const ContentEditor = ({
	initialContent,
	onUpdate,
	placeholder,
	className,
}: ContentEditorProps) => {
	const debouncedUpdateContent = useDebouncedCallback(
		(content: SerializedEditorState) => {
			onUpdate?.(content);
		},
		{
			wait: 600,
		},
	);

	return (
		<Editor
			editorSerializedState={initialContent}
			className={cn("h-full w-full", className)}
			onSerializedChange={debouncedUpdateContent}
			placeholder={placeholder}
		/>
	);
};

export default ContentEditor;
