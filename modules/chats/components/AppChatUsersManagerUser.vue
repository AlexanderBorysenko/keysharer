<template>
	<div class="AppChatUsersManagerUser">
		<div class="AppChatUsersManagerUser__avatar">
			<UserAvatarImage
				:image="user.avatar || ''"
				:alt="user.displayName"
				class="AppChatUsersManagerUser__avatar-image"
			/>
		</div>
		<div class="AppChatUsersManagerUser__info">
			<p class="AppChatUsersManagerUser__username">
				{{ user.displayName }}
				<code v-if="user.id === chatStore.chatState.owner_id"
					>[ADMIN]</code
				>
			</p>
			<p class="AppChatUsersManagerUser__display-name">
				@{{ user.username }}
			</p>
		</div>
		<div
			class="AppChatUsersManagerUser__controls"
			v-if="chatStore.chatState.iAmAdmin"
		>
			<button @click="onKick" class="AppChatUsersManagerUser__button">
				<SvgIcon
					icon="trash"
					class="AppChatUsersManagerUser__button-icon"
				/>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ModelTypes } from '~/graphql/zeus';
import UserAvatarImage from '~/modules/user/components/UserAvatarImage.vue';
import { useChatUsersManagerStore } from '../store/useChatUsersManagerStore';
import { useChatStore } from '../store/useChatStore';

const props = defineProps<{
	user: ModelTypes['User'];
}>();

const chatStore = useChatStore();
const chatUsersManagerStore = useChatUsersManagerStore();

const onKick = () => {
	if (confirm('Are you sure you want to remove this user?')) {
		chatUsersManagerStore.removeMember(props.user.id);
	}
};
</script>

<style scoped lang="scss">
.AppChatUsersManagerUser {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.5rem 0 0.5rem 0;
	border-radius: 0.75rem;
	transition: background 0.2s;
	position: relative;
	&._offline {
		opacity: 0.8;
		cursor: not-allowed;
	}
	&__avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		overflow: hidden;
	}
	&__avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	&__info {
		flex: 1;
	}
	&__username {
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 140%;
		margin-bottom: 0.125rem;
		position: relative;
	}
	&__online-mark {
		margin-top: 0.1em;
	}
	&__display-name {
		font-size: 0.75rem;
		line-height: 150%;
		color: rgba(255, 255, 255, 0.7);
	}
	&__radio-icon {
		width: 1rem;
		height: 1rem;
	}
	&__button {
		width: 1.5rem;
		height: 1.5rem;
		&-icon {
			width: 100%;
			height: 100%;
			transition: color 0.2s;
			&:hover {
				color: var(--danger);
			}
		}
	}
}
</style>
