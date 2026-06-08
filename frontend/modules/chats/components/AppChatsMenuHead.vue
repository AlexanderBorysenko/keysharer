<template>
	<div class="chats-menu-head">
		<button
			class="chats-menu-head__toggle-menu _mobile"
			@click="appSidebarStore.open"
		>
			<SvgIcon icon="hamburger" />
		</button>
		<h2 class="chats-menu-head__title">All chats</h2>
		<NewChatButton
			class="chats-menu-head__new-chat-button"
			:disabled="!isUserSubscribed"
			:disabledReason="
				!isUserSubscribed ? `Available in Pro Plan` : undefined
			"
		/>
	</div>
</template>

<script setup lang="ts">
import SvgIcon from '~/components/SvgIcon.vue';
import NewChatButton from './NewChatButton.vue';
import { useAppSidebarStore } from '~/modules/appSidebar/store/useAppSidebarStore';
const { isUserSubscribed } = storeToRefs(useUserStore());

const appSidebarStore = useAppSidebarStore();
</script>

<style scoped lang="scss">
.chats-menu-head {
	height: var(--header-part-height);
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 1.5rem 2rem;
	border-bottom: var(--header-part-border);
	@media (max-width: 640px) {
		padding: 0 1.5rem;
	}
	&__title {
		font-weight: 500;
		font-size: 1.375rem;
		line-height: 120%;
	}
	&__new-chat-button {
		margin-left: auto;
	}
	&__toggle-menu {
		width: 2rem;
		height: 2rem;
		svg {
			width: 100%;
			height: 100%;
		}
	}
}
</style>
