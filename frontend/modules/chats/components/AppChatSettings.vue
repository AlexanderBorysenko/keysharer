<template>
	<BaseContextModal
		:is-opened="chatSettingsStore.isSettingsModalOpen"
		class="chat-settings"
		@close="chatSettingsStore.closeSettingsModal"
	>
		<div class="chat-settings__inner">
			<div class="chat-settings__main">
				<img
					src="~/assets/images/chats-icon.svg"
					class="chat-settings__chats-icon"
					alt=""
				/>
				<label class="mb-1 block">
					<span class="fs-1-125 mb-0-5 block"> Chat Name </span>
					<BaseInput
						v-model="chatSettingsStore.chatUpdateForm.name"
						label="Chat Title"
						placeholder="Enter chat title"
					/>
				</label>
				<label class="mb-2 block">
					<span class="fs-1-125 mb-0-5 block"> Chat Image </span>
					<BaseImageInput
						v-model="chatSettingsStore.chatUpdateForm.avatar"
						:previous-image-url="chatStore.chatState?.avatar || ''"
						class="mb-1"
					/>
				</label>
				<p
					class="text-danger mb-0-5"
					v-for="error in chatSettingsStore.errors"
				>
					{{ error }}
				</p>
			</div>
			<div class="chat-settings__controls">
				<BaseButton
					type="secondary"
					:large="true"
					@click="chatSettingsStore.closeSettingsModal"
					class="chat-settings__button"
				>
					Cancel
				</BaseButton>
				<BaseButton
					type="primary"
					:large="true"
					@click="chatSettingsStore.updateChatSettings"
					class="chat-settings__button"
					:disabled="chatSettingsStore.loading"
				>
					Save
				</BaseButton>
			</div>
		</div>
	</BaseContextModal>
</template>

<script setup lang="ts">
import BaseImageInput from '~/components/BaseImageInput.vue';
import { useChatSettingsStore } from '../store/useChatSettingsStore';
import { useChatStore } from '../store/useChatStore';

const chatSettingsStore = useChatSettingsStore();
const chatStore = useChatStore();
</script>

<style scoped lang="scss">
.chat-settings {
	&__main {
		padding: 1.5rem;
	}
	&__chats-icon {
		width: 3rem;
		height: 3rem;
		display: block;
		margin-bottom: 1rem;
	}
	&__title {
		font-weight: 500;
		font-size: 1.125rem;
		line-height: 150%;
		margin-bottom: 0.25rem;
	}
	&__controls {
		display: flex;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: var(--ui-light-border);
		& > * {
			flex: 1;
		}
	}
}
</style>
