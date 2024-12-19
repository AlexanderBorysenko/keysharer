<template>
	<div class="app-chat-head">
		<BackButton class="_mobile" @click="chatStore.close" />
		<AppChatHeadInfo />
		<div class="app-chat-head__buttons">
			<KeyWithCounterButton
				:counter="incomingKeysCount"
				class="_mobile app-chat-head__key-button"
				@click="encryptionKeysStore.openCurrentKeyManager"
			/>
			<AppChatOptionsMenu />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useEncryptionKeysStore } from '~/modules/encryption/store/useEncryptionKeysStore';
import { useChatStore } from '../store/useChatStore';
import AppChatHeadInfo from './AppChatHeadInfo.vue';
import AppChatOptionsMenu from './AppChatOptionsMenu.vue';
import { useKeySharingStore } from '~/modules/encryption/store/useKeySharingStore';
import KeyWithCounterButton from '~/components/KeyWithCounterButton.vue';

const chatStore = useChatStore();
const encryptionKeysStore = useEncryptionKeysStore();

const keySharingStore = useKeySharingStore();
const incomingKeysCount = computed(
	() => keySharingStore.currentChatIncomingTransactions.length
);
</script>

<style scoped lang="scss">
.app-chat-head {
	background: #161b26;
	padding: 0rem 1rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex: 0 0 var(--header-part-height);
	border-bottom: var(--header-part-border);
	height: var(--header-part-height);
	&__buttons {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-left: auto;
	}
	&__key-button {
		font-size: 1.5rem;
	}
}
</style>
