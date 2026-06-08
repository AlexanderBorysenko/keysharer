<template>
	<AppChatOutgoingKeySharingTransaction
		v-for="transaction in keySharingStore.currentChatOutgoingTransactions"
		:key="transaction.id"
		:transaction="transaction"
		@close="keySharingStore.deleteOutgoingTransaction(transaction.id)"
	/>
</template>

<script setup lang="ts">
import { useKeySharingStore } from '../store/useKeySharingStore';
import AppChatOutgoingKeySharingTransaction from './AppChatOutgoingKeySharingTransaction.vue';

const keySharingStore = useKeySharingStore();
</script>

<style scoped></style>
