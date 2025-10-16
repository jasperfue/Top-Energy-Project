import { User } from "lucide-react";
import {
	Message,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message.tsx";

export function OutgoingMessage({ message }: { message: string }) {
	return (
		<div className="space-y-4  flex justify-end">
			<Message>
				<MessageContent className="prose-h2:mt-0! prose-h2:scroll-m-0! dark:prose-invert">
					{message}
				</MessageContent>
				<MessageAvatar src="" fallback={<User />} alt="User" />
			</Message>
		</div>
	);
}
