import { types } from "cassandra-driver";
import messageDBService from "../service/messageDBService";
import { throwTooManyRequestsError } from "../../../errors/throwTooManyRequestsError";

export const messageSendDelayMiddleware = async ({
	chatId,
	userId,
}: {
	chatId: types.Uuid;
	userId: types.Uuid;
}): Promise<void> => {
	const lastMessage = await messageDBService.getLastMessageByUserAndChat({
		chatId: chatId,
		userId: userId,
	});

	if (lastMessage) {
		const now = new Date();
		const lastMessageTime = new Date(lastMessage.timestamp);
		const timeDifference = now.getTime() - lastMessageTime.getTime();
		const delay = 500;

		if (timeDifference < delay) {
			return throwTooManyRequestsError(
				"You are sending messages too quickly. Please wait a moment."
			);
		}
	}
};
