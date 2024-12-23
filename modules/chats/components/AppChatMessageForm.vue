<template>
	<div
		class="app-chat-message-form"
		v-if="chatStore.chatState.id"
		:class="{ 'is-sending': isSendingMessage }"
	>
		<AppChatMessageFormAttachmentsPreview
			class="app-chat-message-form__attachments-preview"
		/>
		<div
			class="app-chat-message-form__preview"
			v-if="encryptionKeysStore.isEncryptionEnabled"
		>
			<p class="app-chat-message-form__preview-content">
				{{ encryptedContent }}
			</p>
		</div>

		<p class="app-chat-message-form__warning" v-else>
			<SvgIcon
				icon="warning"
				class="app-chat-message-form__warning-icon"
			/>
			Message will not be encrypted.
			{{
				!encryptionKeysStore.isCurrentKeyValid
					? 'Please provide a Key to secure your messaging'
					: ''
			}}
		</p>
		<div class="app-chat-message-form__main">
			<EmojiSelector
				class="emoji-selector"
				v-if="isEmojiSelectorVisible"
				@select="content += $event"
			/>
			<AppChatMessageFormAttachmentSelect />
			<AppChatMessageFormTextarea v-model="content" @enter="submit" />
			<button
				class="emoji-button"
				:class="{ 'is-active': isEmojiSelectorVisible }"
				@click="isEmojiSelectorVisible = !isEmojiSelectorVisible"
			>
				<SvgIcon icon="emoji" class="icon" />
			</button>
			<button class="send-button" @click="submit">
				<SvgIcon icon="send" class="icon" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import EmojiSelector from '~/components/EmojiSelector.vue';
import SvgIcon from '~/components/SvgIcon.vue';
import { useEncryptionKeysStore } from '~/modules/encryption/store/useEncryptionKeysStore';
import { useChatStore } from '../store/useChatStore';
import { useMessageFormStore } from '../store/useMessageFormStore';
import AppChatMessageFormTextarea from './AppChatMessageFormTextarea.vue';
import AppChatMessageFormAttachmentSelect from './AppChatMessageFormAttachmentSelect.vue';
import AppChatMessageFormAttachmentsPreview from './AppChatMessageFormAttachmentsPreview.vue';

const isEmojiSelectorVisible = ref(false);
const chatStore = useChatStore();
const encryptionKeysStore = useEncryptionKeysStore();
const { sendTypingStatus } = useUserSubscriptionsStore();
const messageFormState = useMessageFormStore();
const { content, encryptedContent, isSendingMessage } =
	storeToRefs(messageFormState);
const submit = async () => {
	if (chatStore.chatState.id) await messageFormState.submitMessageForm();
};

// Needed to ensure that the typing status is sent to the correct chat
const latestChatId = ref<string>(chatStore.chatState.id || '');

let typingTimeout: NodeJS.Timeout | null = null;
const isTyping = ref(false);
watch(content, () => {
	if (typingTimeout) clearTimeout(typingTimeout);
	if (!content.value) {
		isTyping.value = false;
		return;
	}
	isTyping.value = true;
	typingTimeout = setTimeout(() => {
		isTyping.value = false;
	}, 500);
});
watch(
	() => isTyping.value,
	async isTyping => {
		if (latestChatId.value)
			await sendTypingStatus(latestChatId.value, isTyping);
	}
);

const abortTypingStatus = async () => {
	if (latestChatId.value) await sendTypingStatus(latestChatId.value, false);
};
watch(
	() => chatStore.chatState.id,
	async chatId => {
		// Ensure that the previous chat typing status is set to false
		await abortTypingStatus();
		// Update the latest chat id if the chat id is not null
		if (chatId) latestChatId.value = chatId;
	}
);
onMounted(() => {
	window.addEventListener('beforeunload', abortTypingStatus);
});
onUnmounted(() => {
	window.removeEventListener('beforeunload', abortTypingStatus);
	abortTypingStatus();
});
</script>

<style scoped lang="scss">
@use '~/styles/vars.scss' as *;
.app-chat-message-form {
	position: relative;
	transition: filter 0.2s;
	&.is-sending {
		filter: grayscale(1);
		cursor: wait;
	}
	&__main {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.75rem 0.75rem 0.75rem 1rem;
		gap: 0.5rem;
		background: #242833;
		border: 0.0625rem solid rgba(255, 255, 255, 0.08);
		border-radius: 0.75rem;
		position: relative;
		@media (max-width: $mobile-width) {
			padding: 0.25rem 0.25rem 0.25rem 0.5rem;
		}
	}
	&__attachments-preview {
		position: absolute;
		bottom: calc(100% + 0.25rem);
		left: 0;
	}
	&__preview {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.75rem;
		line-height: 1em;
		height: 2.3em;
		overflow: hidden;
		max-width: 100%;
		padding: 0.5rem;
		word-break: break-all;
		display: block;
	}
	&__preview-content {
		text-overflow: ellipsis;
		word-break: break-all;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}
	&__warning {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(255, 0, 0, 0.1);
		border-radius: 0.75rem;
		color: var(--warning);
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		&-icon {
			width: 1.25rem;
			height: 1.25rem;
		}
	}
	@media (max-width: 640px) {
		padding: 0.5rem;
		gap: 0.25rem;
	}
}
.icon {
	width: 1.5rem;
	height: 1.5rem;
}

.attachment-button,
.emoji-button {
	width: 2.5rem;
	height: 2.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	border: none;
	color: rgba(255, 255, 255, 0.5);
	border-radius: 0.625rem;
	transition: color 0.2s, background 0.2s;
	&:not(:disabled):hover {
		color: #fff;
	}
	&.is-active {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}
}

.emoji-selector {
	position: absolute;
	bottom: calc(100% + 0.5rem);
	right: 0;
	width: min(20rem, 100%);
	overflow: auto;
	max-height: min(10rem, calc(100vh - 10rem));
	@media (max-width: 640px) {
		width: 100%;
	}
}

.send-button {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0.5rem;

	width: 2.5rem;
	height: 2.5rem;
	background: #5645ee;
	border-radius: 0.625rem;
	transition: color 0.2s, background 0.2s;
	&:not(:disabled):hover {
		color: #fff;
		background: #6f5df6;
	}
}

.attachment-button:hover,
.emoji-button:hover,
.send-button:hover {
	color: #fff;
}
</style>
