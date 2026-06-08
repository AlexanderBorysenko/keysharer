<template>
	<div class="app-chat-incoming-key-sharing-transaction">
		<div class="app-chat-incoming-key-sharing-transaction__head">
			<SvgIcon
				icon="key"
				class="app-chat-incoming-key-sharing-transaction__head-icon"
			/>
			<p>
				Received a key from <strong>{{ user?.displayName }}</strong>
			</p>
		</div>
		<div class="app-chat-incoming-key-sharing-transaction__buttons">
			<BaseButton
				type="secondary"
				@click="props.onDecline"
				class="w-full"
			>
				Decline
			</BaseButton>
			<BaseButton type="primary" @click="props.onAccept" class="w-full">
				Apply key
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import SvgIcon from '~/components/SvgIcon.vue';
import { useChatStore } from '~/modules/chats/store/useChatStore';

const chatStore = useChatStore();
const props = defineProps<{
	id: string;
	status: string;
	senderId: string;
	onAccept: () => void;
	onDecline: () => void;
}>();

const user = computed(() => chatStore.getChatUser(props.senderId));
</script>

<style scoped lang="scss">
.app-chat-incoming-key-sharing-transaction {
	border: 0.0625rem solid #ccc;
	border-radius: 0.5rem;
	padding: 0.75rem 1rem 0.75rem 1rem;
	&__buttons {
		display: flex;
		margin-top: 1rem;
		gap: 0.5rem;
	}
	&__head {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
		&-icon {
			width: 2rem;
			height: 2rem;
			flex: 0 0 2rem;
		}
	}
}
</style>
