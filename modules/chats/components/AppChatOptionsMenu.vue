<template>
	<button
		class="chat-options-menu"
		:class="{ _opened: isOptionsOpen }"
		@click="isOptionsOpen = !isOptionsOpen"
		ref="elementRef"
	>
		<SvgIcon icon="details" class="chat-options-menu__icon" />
		<div class="chat-options-menu__options" v-if="isOptionsOpen">
			<AppChatOptionsMenuItem
				icon="settings"
				@click="chatSettingsStore.openSettingsModal"
			>
				Settings
			</AppChatOptionsMenuItem>
			<AppChatOptionsMenuItem
				icon="trash"
				@click="chatDeletionStore.openChatDeletionModal"
			>
				Delete
			</AppChatOptionsMenuItem>
		</div>
	</button>
</template>

<script lang="ts" setup>
import SvgIcon from '~/components/SvgIcon.vue';
import { useChatSettingsStore } from '../store/useChatSettingsStore';
import AppChatOptionsMenuItem from './AppChatOptionsMenuItem.vue';
import { useChatDeletionStore } from '../store/useChatDeletionStore';
const chatSettingsStore = useChatSettingsStore();
const chatDeletionStore = useChatDeletionStore();

const isOptionsOpen = ref(false);

const { elementRef } = useElementOutsideClick(() => {
	isOptionsOpen.value = false;
});
</script>

<style lang="scss">
.chat-options-menu {
	width: 1.5rem;
	height: 1.5rem;
	transition: color 0.2s;
	color: rgba(255, 255, 255, 0.7);
	position: relative;
	&:hover,
	&._opened {
		color: rgba(255, 255, 255, 1);
	}
	&__icon {
		width: 100%;
		height: 100%;
	}

	&__options {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: #161b26;
		border-radius: 0.5rem;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		z-index: 10;
		border-radius: 0.5rem;
		border: var(--ui-light-border);
		box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
		@media (max-width: 640px) {
			padding: 0.25rem;
		}
	}
}
</style>
