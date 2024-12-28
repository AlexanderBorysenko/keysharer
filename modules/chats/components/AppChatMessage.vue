<template>
	<div
		class="message allow-user-select"
		ref="messageElementRef"
		:class="{
			'is-mine': isMine
		}"
	>
		<div class="message__avatar" v-if="!isMine">
			<UserAvatarImage
				:image="messageUser?.avatar || ''"
				class="message__avatar-image"
				:title="messageUser?.displayName"
			/>
			<p class="message__avatar-name" v-if="messageUser">
				{{ messageUser?.displayName }}
			</p>
		</div>
		<div class="message__body">
			<div
				class="message__attachments"
				:class="{
					'_no-margin-bottom': !content.length
				}"
				v-if="message.files && message.files.length > 0"
			>
				<AppChatMessageAttachment
					v-for="file in message.files"
					:key="file.file_name"
					:disableEncryption="message.disable_encryption"
					:file="file"
				/>
			</div>
			<div class="message__main">
				<div
					v-if="content"
					class="message__text-content text-content"
					v-html="content"
				></div>
				<SvgIcon
					v-if="message.type === 'text'"
					icon="message-tail"
					class="message__tail"
				/>
				<div class="message__meta" v-if="message.type === 'text'">
					<small
						v-if="message.disable_encryption"
						class="message-warning"
					>
						<SvgIcon icon="warning" class="message-warning__icon" />
						Not Encrypted
					</small>
					<MessageTime :time="message.timestamp" />
					<MessageStatusIcon
						:isRead="message.is_read || false"
						v-if="isMine"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import SvgIcon from '~/components/SvgIcon.vue';
import MessageTime from './MessageTime.vue';
import MessageStatusIcon from './MessageStatusIcon.vue';
import chatEncryption from '~/modules/encryption/service/chatEncryptionService';
import MarkdownIt from 'markdown-it';
import type { ModelTypes } from '~/graphql/zeus';
import { getGQErrorMessage } from '~/graphql/utils/getGQErrorMessage';
import AppChatMessageAttachment from './AppChatMessageAttachment.vue';
import { useChatStore } from '../store/useChatStore';
import UserAvatarImage from '~/modules/user/components/UserAvatarImage.vue';
import { typedGql } from '~/graphql/zeus/typedDocumentNode';
const md = new MarkdownIt();
const { $apollo } = useNuxtApp();
const { addNotification } = useAppNotificationsStore();

const messageElementRef = ref<HTMLElement | null>(null);

const userStore = useUserStore();
const chatStore = useChatStore();
const isMine = computed(() => userStore.state.id === props.message.user_id);
const messageUser = computed(() => {
	if (isMine.value) return null;
	return chatStore.chatState.users?.find(u => u.id === props.message.user_id);
});

const props = defineProps<{
	message: ModelTypes['Message'];
	onMounted?: () => void;
}>();

const content = computed(() => {
	let content = '';
	if (props.message.type !== 'text' || props.message.disable_encryption)
		content = props.message.content;
	else content = chatEncryption.decryptTextMessage(props.message.content);

	return md.render(content);
});

const isReadByMe = computed(() =>
	(props.message.reads || []).includes(userStore.state.id)
);

const messageUserJoinedAt = computed<number>(() => {
	const foundTime = chatStore.chatState.usersJoinedAt?.find(
		u => u.userId === messageUser.value?.id
	)?.joinedAt;
	if (foundTime) return new Date(+foundTime).getTime();
	return new Date().getTime();
});

// prevent marking as read if already read by me, or if it's my message, or if it's a message sent before the user joined the chat
const shouldBeRead = computed(() => {
	return (
		!isReadByMe.value &&
		!isMine.value &&
		+props.message.timestamp > messageUserJoinedAt.value
	);
});

const readMessage = async () => {
	if (!shouldBeRead.value) return;
	try {
		await $apollo.value?.mutate({
			mutation: typedGql('mutation')({
				readMessage: [{ messageId: props.message.id }, true]
			})
		});
	} catch (e: any) {
		addNotification({
			type: 'error',
			message: getGQErrorMessage(e)
		});
		console.error(e);
	}
};

onMounted(() => {
	if (props.onMounted) props.onMounted();

	const observer = new IntersectionObserver(entries => {
		console.log('entries', entries);
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				readMessage();
				observer.unobserve(entry.target);
			}
		});
	});

	if (!shouldBeRead.value) return;
	console.log('observe', messageElementRef.value);
	observer.observe(messageElementRef.value!);

	onUnmounted(() => {
		observer.disconnect();
	});
});
</script>

<style scoped lang="scss">
.message {
	display: flex;
	align-items: flex-end;
	gap: 0.5rem;
	max-width: min(42.125rem, calc(100% - 2rem));
	--message-side-space: 0.625rem;
	&__avatar {
		position: relative;
		&-image {
			width: 2rem;
			height: 2rem;
			border-radius: 50%;
			overflow: hidden;
			pointer-events: all;
		}
		&-name {
			position: absolute;
			bottom: calc(100% + 0.25rem);
			background: #232c3d;
			padding: 0.25rem 0.5rem;
			z-index: 10;
			border-radius: 0.5rem;
			display: none;
		}
		&-image:hover + &-name {
			display: block;
		}
	}
	&__body {
		position: relative;
		color: #fff;
		border-radius: 0.625rem;
		width: fit-content;
	}
	&__attachments {
		border-radius: 0.625rem;
		overflow: hidden;
	}
	&__main {
		padding: 0.5rem 1rem;
		width: 100%;
	}
	&__text-content {
		margin-bottom: 0.5rem;
		:deep(*) {
			line-break: anywhere;
			word-break: break-all;
		}
	}
	&__meta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		justify-content: flex-end;
	}
	&__tail {
		width: 1.375rem;
		height: 1.125rem;
		position: absolute;
		bottom: 0.125rem;
	}
	&__attachments {
		margin-bottom: 1rem;
	}
	.message-warning {
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-right: 0.5rem;
		color: rgba(255, 255, 255, 0.5);
		&__icon {
			width: 1rem;
			height: 1rem;
		}
	}
	&:not(:last-child) {
		margin-bottom: 1rem;
		@media (max-width: 640px) {
			margin-bottom: 1rem;
		}
	}
	&:not(.is-mine) {
		margin-left: var(--message-side-space);
		.message__body {
			background: #161b26;
		}
	}
	&:not(.is-mine) &__tail {
		color: #161b26;
		transform: rotateY(180deg);
		left: calc(-1 * var(--message-side-space));
	}

	&.is-mine {
		margin-right: var(--message-side-space);
		margin-left: auto;
		.message__body {
			background: #232c3d;
		}
	}
	&.is-mine &__tail {
		color: #232c3d;
		right: calc(-1 * var(--message-side-space));
	}
	@media (max-width: 640px) {
		font-size: 16px;
	}
}
</style>
