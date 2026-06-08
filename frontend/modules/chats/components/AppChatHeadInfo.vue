<template>
	<div class="app-chat-head-info">
		<div class="app-chat-head-info__avatar">
			<ChatAvatarImage
				:image="chatStore.chatState.avatar || ''"
				class="app-chat-head-info__avatar-image"
			/>
		</div>
		<div class="app-chat-head-info__content">
			<h2 class="app-chat-head-info__title">
				{{ chatStore.chatState.name }}
			</h2>
			<p class="app-chat-head-info__subtitle">
				<span
					v-if="chatStore.typingStatus"
					class="app-chat-head-info__typing"
				>
					{{ chatStore.typingStatus }}
				</span>
				<span
					class="app-chat-head-info__online-status"
					v-else
					:class="{
						_online: onlineUsersCount,
						_offline: !onlineUsersCount
					}"
				>
					{{ onlineStatus }}
				</span>
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useOnlineStatusesStore } from '~/modules/user/store/onlineStatusesStore';
import { useChatStore } from '../store/useChatStore';
import ChatAvatarImage from './ChatAvatarImage.vue';
const chatStore = useChatStore();
const userStore = useUserStore();
const { countUsersSelectionOnline, listenToUser } = useOnlineStatusesStore();
watch(
	() => chatStore.chatState.users,
	() => {
		chatStore.chatState.users?.forEach(user => {
			listenToUser(user.id, user.isOnline || false);
		});
	},
	{ immediate: true }
);
const onlineUsersCount = computed(() => {
	if (!chatStore.chatState.users) return 0;
	return countUsersSelectionOnline(
		chatStore.chatState.users
			.map(user => user.id)
			.filter(id => id !== userStore.state.id)
	);
});
const onlineStatus = computed(() => {
	if (chatStore.chatState.users?.length === 2) {
		return onlineUsersCount.value ? 'Online' : 'Offline';
	} else {
		return onlineUsersCount.value
			? `${onlineUsersCount.value} online`
			: 'Offline';
	}
});
</script>

<style scoped lang="scss">
.app-chat-head-info {
	display: flex;
	align-items: center;
	gap: 1rem;
	&__avatar {
		width: 3rem;
		height: 3rem;
		border-radius: 0.625rem;
		overflow: hidden;
		&-image {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		@media (max-width: 640px) {
			width: 2.5rem;
			height: 2.5rem;
		}
	}
	&__title {
		font-weight: 500;
		font-size: 1.25rem;
		line-height: 120%;

		overflow: hidden;
		text-overflow: ellipsis;
		-webkit-line-clamp: 1;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		height: 1.25em;

		@media (max-width: 640px) {
			font-weight: 500;
			font-size: 1rem;
			margin-bottom: 0.25rem;
		}
	}
	&__subtitle {
		font-weight: 400;
		font-size: 1rem;
		line-height: 150%;
		letter-spacing: -0.01em;
		color: rgba(255, 255, 255, 0.7);
		@media (max-width: 640px) {
			font-weight: 400;
			font-size: 0.875rem;
			line-height: 140%;
			letter-spacing: -0.01em;
			color: rgba(255, 255, 255, 0.7);
		}
	}
	&__online-status {
		&._online {
			color: var(--success);
		}
		&._offline {
			color: rgba(255, 255, 255, 0.7);
		}
	}
	&__typing {
		color: var(--purple);
	}
	@media (max-width: 640px) {
		gap: 0.75rem;
	}
}
</style>
