<template>
	<div
		class="chats-list"
		:class="{
			'is-switching-chat': chatStore.isLoadingChat
		}"
	>
		<ChatCard
			v-for="chat in chatsListStore.chats"
			:key="chat.id"
			:chat="chat"
			:isActive="chatStore.chatState.id === chat.id"
			@click="() => chatStore.setChat(chat.id)"
		/>
	</div>
</template>

<script setup lang="ts">
import type { ModelTypes } from '~/graphql/zeus';
import { useChatStore } from '../store/useChatStore';
import ChatCard from './ChatCard.vue';
import { useChatsListStore } from '../store/useChatsListStore';

const chatsListStore = useChatsListStore();
const chatStore = useChatStore();
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
