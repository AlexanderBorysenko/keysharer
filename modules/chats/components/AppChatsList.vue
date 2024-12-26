<template>
	<div
		class="chats-list"
		:class="{
			'is-switching-chat': chatStore.isLoadingChat
		}"
	>
		<ChatCard
			v-for="chatCard in chatCards"
			:key="chatCard.id"
			:chat="chatCard"
			:isActive="chatStore.chatState.id === chatCard.id"
			@click="() => chatStore.setChat(chatCard.id)"
		/>
	</div>
</template>

<script setup lang="ts">
import type { ModelTypes } from '~/graphql/zeus';
import { useChatStore } from '../store/useChatStore';
import ChatCard from './ChatCard.vue';
import { handleUnauthenticatedError } from '~/graphql/utils/handleUnauthenticatedError';
import { useOnlineStatusesStore } from '~/modules/user/store/onlineStatusesStore';
const chatStore = useChatStore();
const { $gqClient, $onWsErrorResolved, $removeOnWsErrorResolved } =
	useNuxtApp();

const chatCards = ref<ModelTypes['Chat'][]>([]);
const {
	onChatCreated,
	offChatCreated,
	onChatDeleted,
	offChatDeleted,
	onChatUpdated,
	offChatUpdated,
	onUnreadMessagesCountChange,
	offUnreadMessagesCountChange
} = useUserSubscriptionsStore();
const onlineStatusesStore = useOnlineStatusesStore();
const fetchChats = async () => {
	try {
		const response = await $gqClient('query')({
			myChats: {
				id: true,
				users: {
					id: true,
					username: true,
					displayName: true,
					avatar: true,
					isOnline: true,
					role: true
				},
				avatar: true,
				updated_at: true,
				name: true,
				owner_id: true,
				unread_messages_count: true
			}
		});
		chatCards.value = response.myChats;

		chatCards.value.forEach(chatCard => {
			chatCard.users?.forEach(user => {
				onlineStatusesStore.listenToUser(
					user.id,
					user.isOnline || false
				);
			});
		});
	} catch (e: any) {
		handleUnauthenticatedError(e);
		console.error(e);
	}
};

onMounted(() => {
	fetchChats();
	$onWsErrorResolved(fetchChats);
	onUnmounted(() => {
		$removeOnWsErrorResolved(fetchChats);
	});
});
const moveChatToTop = (chatUpdated: ModelTypes['Chat']) => {
	const chatIndex = chatCards.value.findIndex(
		chatCard => chatCard.id === chatUpdated.id
	);
	if (chatIndex !== -1) {
		chatCards.value.splice(chatIndex, 1);
	}
	chatCards.value.unshift(chatUpdated);
};

const { pushToQueue } = useQueue();

const onChatCreatedCallback = (chatCreated: ModelTypes['Chat']) => {
	console.log('>>> chat Created', chatCreated);
	pushToQueue(async () => {
		moveChatToTop(chatCreated);
	});
};

const onChatDeletedCallback = (chatDeleted: string) => {
	console.log('>>> chat Deleted');
	pushToQueue(async () => {
		chatCards.value = chatCards.value.filter(
			chatCard => chatCard.id !== chatDeleted
		);
	});
};

const onChatUpdatedCallback = (chatUpdated: ModelTypes['Chat']) => {
	console.log('>>> chat Updated', chatUpdated);
	pushToQueue(async () => {
		const chatIndex = chatCards.value.findIndex(
			chatCard => chatCard.id === chatUpdated.id
		);
		if (chatIndex === -1) return;
		chatCards.value[chatIndex] = chatUpdated;
	});
	chatUpdated.users?.forEach(user => {
		onlineStatusesStore.listenToUser(user.id, user.isOnline || false);
	});
};

const onUnreadMessagesCountChangeHandler = (
	payload: ModelTypes['UnreadMessagesCount']
) => {
	console.log('>>> unreadMessagesCount Change', payload);
	pushToQueue(async () => {
		const chatIndex = chatCards.value.findIndex(
			chatCard => chatCard.id === payload.chatId
		);
		if (chatIndex !== -1) {
			chatCards.value[chatIndex].unread_messages_count =
				payload.unreadCount;
			moveChatToTop(chatCards.value[chatIndex]);
		}
	});
};

onMounted(() => {
	onChatCreated(onChatCreatedCallback);
	onChatDeleted(onChatDeletedCallback);
	onChatUpdated(onChatUpdatedCallback);
	onUnreadMessagesCountChange(onUnreadMessagesCountChangeHandler);
});

onUnmounted(() => {
	offChatCreated(onChatCreatedCallback);
	offChatDeleted(onChatDeletedCallback);
	offChatUpdated(onChatUpdatedCallback);
	offUnreadMessagesCountChange(onUnreadMessagesCountChangeHandler);
});
</script>

<style scoped lang="scss">
.chats-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	transition: opacity 0.3s ease;
	&.is-switching-chat {
		opacity: 0.8;
		pointer-events: none;
	}
}
</style>
