<template>
	<BaseContextModal
		:is-opened="chatDeletionStore.isChatDeletionModalOpen"
		class="chat-deletion"
		@close="chatDeletionStore.closeChatDeletionModal"
	>
		<div class="chat-deletion__inner">
			<div class="chat-deletion__main">
				<img
					src="~/assets/images/delete-icon.svg"
					class="chat-deletion__icon"
					alt=""
				/>
				<label class="mb-1 block">
					<span class="fs-1-125 mb-0-5 block">Delete Chat?</span>
				</label>
				<p
					class="text-danger mb-0-5"
					v-for="error in chatDeletionStore.errors"
				>
					{{ error }}
				</p>
			</div>
			<div class="chat-deletion__controls">
				<BaseButton
					type="secondary"
					:large="true"
					@click="chatDeletionStore.closeChatDeletionModal"
					class="chat-deletion__button"
				>
					Cancel
				</BaseButton>
				<BaseButton
					type="primary"
					:large="true"
					@click="chatDeletionStore.deleteChat"
					class="chat-deletion__button"
					:disabled="chatDeletionStore.loading"
				>
					Confirm
				</BaseButton>
			</div>
		</div>
	</BaseContextModal>
</template>

<script setup lang="ts">
import { useChatDeletionStore } from '../store/useChatDeletionStore';

const chatDeletionStore = useChatDeletionStore();
</script>

<style scoped lang="scss">
.chat-deletion {
	&__main {
		padding: 1.5rem;
	}
	&__icon {
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
