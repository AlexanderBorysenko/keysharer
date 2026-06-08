<template>
	<article class="chat-card" :class="{ _active: isActive }" ref="elementRef">
		<KeyWithCounterButton
			class="chat-card__keys-notification"
			:counter="incomingKeysCount"
			v-if="incomingKeysCount"
		/>
		<div class="chat-card__image-container">
			<ChatAvatarImage
				:image="chat.avatar || ''"
				:alt="chat.name"
				class="chat-card__image"
			/>
		</div>
		<div class="chat-card__body">
			<div class="chat-card__head">
				<h3 class="chat-card__title">
					<span class="chat-card__title-text">
						{{ chat.name }}
					</span>
					<span class="chat-card__title-online-mark">
						<ClientOnly>
							<OnlineMark :users="chat.users || []" />
						</ClientOnly>
					</span>
				</h3>
			</div>
			<p class="chat-card__messages-status">
				<span class="chat-card__messages-status-text">
					{{ status }}
				</span>
				<span
					class="chat-card__latest-messages-counter"
					v-if="chat.unread_messages_count! > 0"
				>
					{{ chat.unread_messages_count }}
				</span>
			</p>
		</div>
	</article>
</template>

<script setup lang="ts">
import type { ModelTypes } from '~/graphql/zeus';
import ChatAvatarImage from './ChatAvatarImage.vue';
import KeyWithCounterButton from '~/components/KeyWithCounterButton.vue';
import { useKeySharingStore } from '~/modules/encryption/store/useKeySharingStore';
import OnlineMark from '~/components/OnlineMark.vue';
import { useUsersTypingStatusesStore } from '../store/useUsersTypingStatusesStore';

const props = defineProps<{
	chat: ModelTypes['Chat'];
	isActive: boolean;
}>();

const elementRef = ref<HTMLElement | null>(null);

const { getTypingUsers } = useUsersTypingStatusesStore();
const typingUsers = computed(
	() => getTypingUsers(props.chat?.users || [], props.chat.id) || []
);

const typingStatus = computed(() => {
	if (typingUsers.value.length === 0) return '';
	if (typingUsers.value.length === 1)
		return `${typingUsers.value[0].displayName} is typing...`;
	return 'Several people are typing...';
});

const status = computed(() => {
	if (typingStatus.value) return typingStatus.value;
	if (props.chat.unread_messages_count! > 0) return 'New private messages';
	return 'No new messages';
});

const keySharingStore = useKeySharingStore();
const incomingKeysCount = computed(
	() => keySharingStore.getChatIncomingTransactions(props.chat.id).length
);
</script>

<style scoped lang="scss">
.chat-card {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.5rem 0.75rem;
	border-radius: 0.75rem;
	cursor: pointer;
	transition: background 0.2s;
	position: relative;
	&:hover {
		background: rgba(255, 255, 255, 0.06);
	}
	&__keys-notification {
		position: absolute;
		top: calc(50% - 0.75rem);
		left: -0.75rem;
		font-size: 1.25rem;
	}
	&._active {
		background: rgba(255, 255, 255, 0.06);
		cursor: default;
		pointer-events: none;
	}
	&__image-container {
		width: 3rem;
		height: 3rem;
		border-radius: 0.625rem;
		overflow: hidden;
	}
	&__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	&__body {
		flex: 1;
	}
	&__head {
		display: flex;
		align-items: center;
		margin-bottom: 0.125rem;
	}

	&__title {
		display: flex;
		font-weight: 500;
		font-size: 1.125rem;
		line-height: 150%;
		margin-right: auto;
		gap: 0.25rem;
		// max 1 line, eclipse with ...
		&-text {
			overflow: hidden;
			text-overflow: ellipsis;
			-webkit-line-clamp: 1;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			height: 1.4em;
		}
		&-online-mark {
			flex: 0 0 max-content;
		}
	}

	&__message-status-icon {
		margin-right: 0.25rem;
	}

	&__messages-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: 400;
		font-size: 1rem;
		line-height: 150%;
		gap: 0.25rem;
		color: rgba(255, 255, 255, 0.7);
	}

	&__latest-messages-counter {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1.5em;
		padding: 0 0.375rem;
		background: var(--purple);
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 140%;
		color: #ffffff;
	}
	&__messages-status-text {
		overflow: hidden;
		text-overflow: ellipsis;
		height: 1.4em;
		-webkit-line-clamp: 1;
		display: -webkit-box;
		-webkit-box-orient: vertical;
	}
}
</style>
