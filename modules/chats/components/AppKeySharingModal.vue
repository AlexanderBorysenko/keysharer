<template>
	<BaseContextModal
		v-if="chatStore.chatState.id"
		:is-opened="keySharingStore.isKeySharingModalOpened"
		@close="onClose"
	>
		<div class="key-sharing">
			<div class="key-sharing__main">
				<img
					src="~/assets/images/chats-icon.svg"
					class="key-sharing__chats-icon"
					alt=""
				/>
				<h2 class="key-sharing__title mb-1">
					Share your current encryption key
				</h2>
				<BasePasswordInput
					class="mb-1"
					:disabled="true"
					:model-value="encryptionKeyStore.currentKey"
				/>
				<p class="key-sharing__instructions">
					Send your encryption key to the conversation
					<strong>online</strong> members.
				</p>
				<StaticUserSelectField
					v-model="targetUsers"
					:users="chatUsers || []"
					class="key-sharing__user-select"
				/>
			</div>
			<div class="key-sharing__controls">
				<BaseButton
					type="secondary"
					:large="true"
					@click="keySharingStore.closeKeySharingModal"
					class="key-sharing__button"
				>
					Cancel
				</BaseButton>
				<BaseButton
					type="primary"
					:large="true"
					@click="share"
					class="key-sharing__button"
					:disabled="!targetUsers.length"
					:disabled-reason="
						!targetUsers.length
							? 'Select a user to share a key'
							: ''
					"
				>
					Share Key
				</BaseButton>
			</div>
		</div>
	</BaseContextModal>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import BaseContextModal from '~/components/BaseContextModal.vue';
import StaticUserSelectField from '~/modules/user/components/StaticUserSelectField.vue';
import { useChatStore } from '../store/useChatStore';
import { useKeySharingStore } from '~/modules/encryption/store/useKeySharingStore';
import { useEncryptionKeysStore } from '~/modules/encryption/store/useEncryptionKeysStore';

const userStore = useUserStore();
const chatStore = useChatStore();
const chatUsers = computed(() =>
	chatStore.chatState.users?.filter(user => user.id !== userStore.state.id)
);

const keySharingStore = useKeySharingStore();

const targetUsers = ref<string[]>([]);

const onClose = () => {
	keySharingStore.closeKeySharingModal();
	targetUsers.value = [];
};

const share = () => {
	targetUsers.value.forEach(userId => {
		keySharingStore.sendKey({
			chatId: chatStore.chatState.id || '',
			receiverId: userId
		});
	});
	onClose();
};

const encryptionKeyStore = useEncryptionKeysStore();
</script>

<style scoped lang="scss">
.key-sharing {
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
