<template>
	<BaseContextModal
		:is-opened="isChatCreationOpened"
		@close="chatCreationState.closeChatCreation"
	>
		<div class="chat-creation">
			<div class="chat-creation__main">
				<img
					src="~/assets/images/chats-icon.svg"
					class="chat-creation__chats-icon"
					alt=""
				/>
				<h2 class="chat-creation__title">Create a new chat</h2>
				<p class="chat-creation__instructions">
					To start a new chat find a person by @UserName
				</p>
				<UserSelectField
					v-model="targetUserId"
					class="chat-creation__user-select"
				/>
			</div>
			<div class="chat-creation__controls">
				<BaseButton
					type="secondary"
					:large="true"
					@click="chatCreationState.closeChatCreation"
					class="chat-creation__button"
				>
					Cancel
				</BaseButton>
				<BaseButton
					type="primary"
					:large="true"
					@click="chatCreationState.createChat"
					class="chat-creation__button"
					:disabled="!targetUserId"
					:disabled-reason="
						!targetUserId ? 'Select a user to chat with' : ''
					"
				>
					Start Chatting
				</BaseButton>
			</div>
		</div>
	</BaseContextModal>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import useChatCreationStore from '../store/useChatCreationStore';
import BaseContextModal from '~/components/BaseContextModal.vue';
import UserSelectField from '~/modules/user/components/UserSelectField.vue';

const chatCreationState = useChatCreationStore();
const { isChatCreationOpened, targetUserId } = storeToRefs(chatCreationState);
</script>

<style scoped lang="scss">
.chat-creation {
	display: flex;
	flex-direction: column;
	--spacing: 1.5rem;
	&__main {
		padding: var(--spacing);
		position: relative;
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
	&__instructions {
		font-weight: 400;
		font-size: 0.875rem;
		line-height: 140%;
		letter-spacing: -0.01em;
		color: rgba(255, 255, 255, 0.7);
	}
	&__user-select {
		margin-top: var(--spacing);
	}
	&__controls {
		display: flex;
		gap: 0.75rem;
		padding: var(--spacing);
		border-top: var(--ui-light-border);
	}
	&__button {
		flex: 1;
	}
}
</style>
