<template>
	<div class="app-chat-outgoing-key-sharing-transaction">
		<div
			class="app-chat-outgoing-key-sharing-transaction__head"
			v-if="!transaction.compleat"
		>
			<RefreshingSpinner
				class="app-chat-outgoing-key-sharing-transaction__head-icon"
			/>
			<p>
				Sending key to <strong>{{ user?.displayName }}</strong>
			</p>
		</div>
		<div
			class="app-chat-outgoing-key-sharing-transaction__head"
			:class="{
				_success: transaction.status === 'success',
				'_network-error': transaction.status === 'networkError'
			}"
			v-else
		>
			<p v-if="transaction.status === 'success'">
				Key successfully sent to
				<strong>{{ user?.displayName }}</strong>
			</p>
			<p v-else-if="transaction.status === 'networkError'">
				Network error occurred while sending a key to
				<strong>{{ user?.displayName }}</strong
				>. Please try again later.
			</p>
		</div>
		<button
			class="app-chat-outgoing-key-sharing-transaction__close"
			@click="onClose"
		>
			<SvgIcon
				icon="cross"
				class="app-chat-outgoing-key-sharing-transaction__close-icon"
				@click="onClose"
			/>
		</button>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import SvgIcon from '~/components/SvgIcon.vue';
import { useChatStore } from '~/modules/chats/store/useChatStore';
import type { OutgoingKeySharingTransaction } from '../store/useKeySharingStore';

const chatStore = useChatStore();
const props = defineProps<{
	transaction: OutgoingKeySharingTransaction;
	onClose: () => void;
}>();

const user = computed(() =>
	chatStore.getChatUser(props.transaction.receiverId)
);
</script>

<style scoped lang="scss">
.app-chat-outgoing-key-sharing-transaction {
	border: 0.0625rem solid #ccc;
	border-radius: 0.5rem;
	padding: 0.75rem 1rem 0.75rem 1rem;
	display: flex;
	align-items: center;
	&__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		&._network-error {
			color: var(--danger);
		}
		&-icon {
			width: 1.25rem;
			height: 1.25rem;
			flex: 0 0 1.25rem;
		}
	}
	&__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex: 0 0 2rem;
		background: #5645ee;
		margin-left: auto;
		background: #5645ee;
		border: 0.0625rem solid rgba(255, 255, 255, 0.08);
		border-radius: 0.375rem;
		transition: background 0.2s;
		&:hover {
			background: #6f5ff5;
		}
		&-icon {
			width: 1.25rem;
			height: 1.25rem;
		}
	}
}
</style>
