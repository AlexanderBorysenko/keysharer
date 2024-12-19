<template>
	<button
		class="user-account-nav-button"
		:class="{ active: isActiveMenuItem }"
		@click="router.push({ name: 'account' })"
	>
		<div class="user-account-nav-button__avatar-container">
			<UserAvatarImage
				class="user-account-nav-button__avatar"
				:image="user.state.avatar || ''"
			/>
		</div>
	</button>
</template>

<script setup lang="ts">
import UserAvatarImage from './UserAvatarImage.vue';

const route = useRoute();
const user = useUserStore();
const router = useRouter();
const isActiveMenuItem = computed(() =>
	route.name?.toString().includes('account')
);
</script>

<style scoped lang="scss">
.user-account-nav-button {
	position: relative;
	height: var(--header-part-height);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	&.active {
		background-color: #1a1a1a;
	}
	&__avatar-container {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.5rem;
		overflow: hidden;
	}
	&__avatar {
		object-fit: contain;
		width: 100%;
		height: 100%;
	}
}
</style>
