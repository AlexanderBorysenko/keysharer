<template>
	<div class="chats-menu">
		<AppChatsMenuHead />
		<div class="chats-menu__chats-list-container">
			<AppChatsList />
		</div>
		<div class="chats-menu__cta-container" v-if="!isUserSubscribed">
			<CallToActionBanner />
		</div>
	</div>
</template>

<script setup lang="ts">
import CallToActionBanner from '~/modules/subscription/components/CallToActionBanner.vue';
import AppChatsList from './AppChatsList.vue';
import AppChatsMenuHead from './AppChatsMenuHead.vue';

const userStore = useUserStore();
const { isUserSubscribed } = storeToRefs(userStore);
</script>

<style scoped lang="scss">
.chats-menu {
	background: var(--bg-dark-lighter);
	display: flex;
	flex-direction: column;
	&__chats-list-container {
		padding: 1.5rem;
		flex: 1;
		overflow-y: auto;
	}
	&__cta-container {
		padding: 1.5rem;
	}
	@media (max-width: 640px) {
		position: fixed;
		inset: 0;
		z-index: 10;
	}
}
</style>
