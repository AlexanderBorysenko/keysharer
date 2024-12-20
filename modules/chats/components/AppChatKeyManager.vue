<template>
	<div
		class="app-chat-key-settings"
		:class="{
			_opened: encryptionKeysStore.isCurrentKeyManagerOpened
		}"
	>
		<div class="app-chat-key-settings__head">
			<BackButton
				class="_mobile"
				@click="encryptionKeysStore.closeCurrentKeyManager"
			/>
			<h2 class="app-chat-key-settings__head-title">Chat Encryption</h2>
		</div>
		<div class="app-chat-key-settings__main">
			<AppChatKeyField class="app-chat-key-settings__key-field" />
			<div class="app-chat-key-settings__features">
				<h3 class="app-chat-key-settings__main-part-title">
					Key Exchange
				</h3>
				<ShareChatKeyButton />
				<AppChatOutgoingKeySharingTransactions />
				<AskForChatKeyButton />
			</div>
			<AppKeySharingModal />
		</div>
		<div
			class="app-chat-key-settings__footer"
			v-if="
				chatStore.chatState.id && encryptionKeysStore.isCurrentKeyValid
			"
		>
			<BaseButton
				type="secondary"
				v-if="!forceEncryptionDisabled"
				@click="forceEncryptionDisabled = true"
			>
				Disable Encryption
			</BaseButton>
			<BaseButton
				v-if="forceEncryptionDisabled"
				@click="forceEncryptionDisabled = false"
				type="primary"
			>
				Enable Encryption
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import AppChatKeyField from '~/modules/encryption/components/AppChatKeyField.vue';
import AskForChatKeyButton from '~/modules/encryption/components/AskForChatKeyButton.vue';
import ShareChatKeyButton from '~/modules/encryption/components/ShareChatKeyButton.vue';
import { useEncryptionKeysStore } from '~/modules/encryption/store/useEncryptionKeysStore';
import { useChatStore } from '../store/useChatStore';
import AppChatOutgoingKeySharingTransactions from '~/modules/encryption/components/AppChatOutgoingKeySharingTransactions.vue';
import AppKeySharingModal from './AppKeySharingModal.vue';
import BaseCheckbox from '~/components/BaseCheckbox.vue';

const encryptionKeysStore = useEncryptionKeysStore();
const {
	forceEncryptionDisabled,
	isCurrentKeyEditing,
	isNewKeyValid,
	newKeyRequirement
} = storeToRefs(encryptionKeysStore);

const chatStore = useChatStore();
</script>

<style scoped lang="scss">
.app-chat-key-settings {
	background: #161b26;
	display: flex;
	flex-direction: column;
	--horizontal-padding: 2rem;
	--vertical-padding: 1.5rem;
	max-height: 100vh;
	height: auto;
	@supports (height: 100dvh) {
		max-height: 100dvh;
	}
	&__head {
		height: var(--header-part-height);
		border-bottom: var(--header-part-border);
		padding: 0.5rem var(--horizontal-padding);
		display: flex;
		gap: 0.5rem;
		align-items: center;
		&-title {
			font-weight: 500;
			font-size: 1.375rem;
			line-height: 120%;
		}
	}
	&__main {
		flex: 1;
		overflow: auto;
	}
	&__features {
		padding: var(--vertical-padding) var(--horizontal-padding);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	&__main-part-title {
		font-weight: 500;
		font-size: 1.125rem;
		line-height: 150%;
	}
	&__key-field {
		padding: var(--vertical-padding) var(--horizontal-padding);
	}
	&__footer {
		display: flex;
		gap: 0.75rem;
		border-top: var(--header-part-border);
		padding: var(--vertical-padding) var(--horizontal-padding);
		& > * {
			flex: 1;
		}
	}
	@media (max-width: 640px) {
		position: fixed;
		inset: 0;
		z-index: 12;
		transform: translateX(100%);
		transition: transform 0.2s;
		--horizontal-padding: 1rem;
		--vertical-padding: 1rem;
		&._opened {
			transform: translateX(0);
		}
	}
}
</style>
