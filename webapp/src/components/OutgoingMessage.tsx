import { User } from "lucide-react";
import { memo } from "react";
import {
	Message,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message.tsx";

function OutgoingMessageComponent({ message }: { message: string }) {
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

const OutgoingMessage = memo(OutgoingMessageComponent);
OutgoingMessage.displayName = "IncomingMessage";
export { OutgoingMessage };
