<template>
	<div
		class="incoming-key-sharing-transactions"
		v-if="keySharingStore.currentChatIncomingTransactions.length"
	>
		<AppChatIncomingKeySharingTransaction
			v-for="transaction in keySharingStore.currentChatIncomingTransactions"
			:key="transaction.id"
			:id="transaction.id"
			:status="transaction.status"
			:senderId="transaction.senderId"
			@accept="
				() => {
					keysStore.setKey(
						transaction.chatId,
						transaction.receivedKey
					);
					keySharingStore.deleteIncomingTransaction(transaction.id);
				}
			"
			@decline="keySharingStore.deleteIncomingTransaction(transaction.id)"
		/>
	</div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/modules/chats/store/useChatStore';
import { useKeySharingStore } from '../store/useKeySharingStore';
import { useEncryptionKeysStore } from '../store/useEncryptionKeysStore';
import AppChatIncomingKeySharingTransaction from './AppChatIncomingKeySharingTransaction.vue';

const keySharingStore = useKeySharingStore();
const keysStore = useEncryptionKeysStore();
</script>

<style scoped lang="scss">
.incoming-key-sharing-transactions {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}
</style>
