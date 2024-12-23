<template>
	<div
		class="user-select-field-search-result-item"
		:class="{ _active: selected, _offline: onOffline && !isOnline }"
		@click="onClick"
		:title="
			!isOnline ? 'The user if offline so you can not select him' : ''
		"
	>
		<div class="user-select-field-search-result-item__avatar">
			<UserAvatarImage
				:image="user.avatar || ''"
				:alt="user.displayName"
				class="user-select-field-search-result-item__avatar-image"
			/>
		</div>
		<div class="user-select-field-search-result-item__info">
			<p class="user-select-field-search-result-item__username">
				{{ user.displayName }}
				<OnlineMark
					v-if="showUserOnlineStatus"
					:users="[user]"
					class="user-select-field-search-result-item__online-mark"
				/>
			</p>
			<p class="user-select-field-search-result-item__display-name">
				@{{ user.username }}
			</p>
		</div>
		<RadioIcon
			:checked="selected"
			class="user-select-field-search-result-item__radio-icon"
		/>
	</div>
</template>

<script setup lang="ts">
import OnlineMark from '~/components/OnlineMark.vue';
import RadioIcon from '~/components/RadioIcon.vue';
import type { ModelTypes } from '~/graphql/zeus';
import UserAvatarImage from '~/modules/user/components/UserAvatarImage.vue';
import { useOnlineStatusesStore } from '../store/onlineStatusesStore';

const props = defineProps<{
	user: ModelTypes['User'];
	showUserOnlineStatus: boolean;
	selected: boolean;
	onClick: () => void;
	onOffline?: () => void;
}>();

const { getUserOnlineStatus } = useOnlineStatusesStore();

const isOnline = computed(() => getUserOnlineStatus(props.user.id));
watch(
	isOnline,
	() => {
		if (!isOnline.value && props.onOffline) {
			props.onOffline();
		}
	},
	{ immediate: true }
);
</script>

<style scoped lang="scss">
.user-select-field-search-result-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.5rem 1rem 0.5rem 0.5rem;
	border-radius: 0.75rem;
	transition: background 0.2s;
	position: relative;
	cursor: pointer;
	&._active {
		background: rgba(255, 255, 255, 0.05);
	}
	&._offline {
		opacity: 0.8;
		cursor: not-allowed;
	}
	&:hover:not(._offline) {
		background: rgba(255, 255, 255, 0.05);
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
}
</style>
