<template>
	<div class="chatting-area">
		<ChatsMenu />
		<TransitionGroup name="app-chat-slide-right">
			<AppChat v-if="chatStore.chatState.id" />
		</TransitionGroup>
		<AppChatKeyManager v-if="chatStore.chatState.id" />
	</div>
	<AppChatCreation />
</template>

<script setup lang="ts">
import ChatsMenu from './AppChatsMenu.vue';
import AppChatCreation from './AppChatCreation.vue';
import AppChat from './AppChat.vue';
import AppChatKeyManager from '~/modules/chats/components/AppChatKeyManager.vue';
import { useChatStore } from '../store/useChatStore';
import { useKeySharingStore } from '~/modules/encryption/store/useKeySharingStore';

const chatStore = useChatStore();
</script>

<style scoped lang="scss">
@use '~/styles/vars.scss' as *;

.chatting-area {
	display: grid;
	--sidebar-width: 23.625rem;
	grid-template-columns: var(--sidebar-width) 1fr var(--sidebar-width);
	position: relative;
	gap: 0.0625rem;
	& > :deep(*) {
		height: 100vh;
	}
	@media (max-width: 1200px) {
		--sidebar-width: 20rem;
	}
	@media (max-width: 640px) {
		display: block;
	}
}
@media (max-width: $mobile-width) {
	.app-chat-slide-right-enter-active,
	.app-chat-slide-right-leave-active {
		transition: transform 0.2s ease;
		transform: translateX(100%);
	}

	.app-chat-slide-right-enter,
	.app-chat-slide-right-leave-to {
		transform: translateX(100%);
	}

	.app-chat-slide-right-enter-to,
	.app-chat-slide-right-leave {
		transform: translateX(0);
	}
}
</style>
