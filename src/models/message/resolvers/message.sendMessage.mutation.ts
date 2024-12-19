import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { prepareMessageTextContent } from "../../../db/utils/prepareMessageTextContent";
import { publishMessageSent } from "./message.newMessage.subscription";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import { encrypt } from "../../../utils/cryptoUtils";
import messageDBService from "../service/messageDBService";
import { publishUnreadMessagesCountChange } from "./message.unreadMessagesCountChage.subscription";
import { getChatUserIds } from "../../chat/service/getChatUserIds";
import { isEmailVerifiedMiddleware } from "../../user/middleware/isEmailVerifiedMiddleware";
import { messageSendDelayMiddleware } from "../middleware/messageSendDelayMiddleware";
import { GraphQLError } from 'graphql';
import { messageFileStorageService, type StoredEncryptedFile } from "../service/messageFileStorageService";

export type SendMessageInput = {
	chatId: types.Uuid;
	content?: string;
	files: UploadedEncryptedFile[];
};
export interface UploadedEncryptedFile {
	filename: string;
	mimeType: string;
	encryptedData: string;
}
export const sendMessageDefs = `
input UploadedEncryptedFileInput {
	filename: String!
	mimeType: String!
	encryptedData: String!
}

input SendMessageInput {
	chatId: ID!
	content: String
	files: [UploadedEncryptedFileInput!]
}

type Mutation {
    sendMessage(input: SendMessageInput!): Boolean!
}
`;

export const sendMessageMutation = async (
	_: any,
	{ input: { chatId, content, files } }: { input: SendMessageInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	// TODO: Modify the middleware logic for production
	// const user = await isEmailVerifiedMiddleware(context);
	const user = await isAuthenticatedMiddleware(context);
	await messageSendDelayMiddleware({ chatId: chatId, userId: user.id });
	const chatUserIds = await getChatUserIds({
		chatId,
	});
	await isUserAChatMemberMiddleware({
		chatId,
		userId: user.id,
		userIds: chatUserIds,
	});

	if (!content && !files.length) {
		throw new GraphQLError('Message content or file is required', {});
	}
	if (content && content.length > 4000) {
		throw new GraphQLError('Message is too long', {});
	}
	if (files?.length > 10) {
		throw new GraphQLError('Too many files per one request', {});
	}

	const messageId = types.TimeUuid.now();

	// Encrypt Message
	content = prepareMessageTextContent(content || '');
	content = encrypt(content);

	const storedFiles: StoredEncryptedFile[] = [];
	if (files.length) {
		try {
			const storedFilesPromises = files.map(file => messageFileStorageService.createMessageFile(file));
			const storedFilesResults = await Promise.all(storedFilesPromises);
			storedFiles.push(...storedFilesResults);
		} catch (error) {
			console.error(error as any);
		}
	}

	try {
		await messageDBService.createMessage({
			messageId,
			chatId,
			userId: user.id,
			content,
		});

		await Promise.all(storedFiles.map(async (file) => {
			await messageDBService.createMessageFile({
				id: file.id,
				chatId: chatId,
				messageId: messageId,
				fileName: file.fileName,
				fileSize: file.fileSize,
				fileType: file.fileType,
			});
		}));

		const message = await messageDBService.getMessage({ messageId });

		await publishMessageSent({ message, userIds: chatUserIds });
		await publishUnreadMessagesCountChange({
			chatId,
			userIds: chatUserIds,
			ownerId: user.id,
		});
	} catch (error) {
		console.error(error as any);
		throw error;
	}

	return true;
};
