<template>
	<AppLayout>
		<div class="chatting-page">
			<AppChatsMenu />
			<slot />
		</div>
		<AppChatCreation />
	</AppLayout>
</template>

<script setup lang="ts">
import AppChatCreation from '~/modules/chats/components/AppChatCreation.vue';
import AppChatsMenu from '~/modules/chats/components/AppChatsMenu.vue';
import AppLayout from './AppLayout.vue';
</script>

<style scoped lang="scss">
.chatting-page {
	display: grid;
	grid-template-columns: var(--sidebar-width) 1fr;
	position: relative;
	gap: 0.0625rem;
	& > :deep(*) {
		height: 100vh;
	}
	@media (max-width: 640px) {
		display: block;
	}
}
</style>
