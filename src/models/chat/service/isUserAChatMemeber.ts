import type { types } from "cassandra-driver";
import { getChatUserIds } from "./getChatUserIds";
import { GraphQLError } from 'graphql';

export const isUserAChatMemberMiddleware = async ({
    userId,
    chatId,
    userIds
}: {
    userId: types.Uuid,
    chatId: types.Uuid,
    userIds?: types.Uuid[]
}) => {
    userIds = userIds || await getChatUserIds({
        chatId
    });

    if (!userIds.map(id => id.toString()).includes(userId.toString())) {
        throw new GraphQLError('User is not a member of this chat', {
            extensions: {
                code: 'UNAUTHORIZED',
            },
        })
    }
}