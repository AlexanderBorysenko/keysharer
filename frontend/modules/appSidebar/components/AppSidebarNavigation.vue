<template>
	<div class="app-main-navigation">
		<AppSidebarNavigationItem
			icon="chats"
			title="Chats"
			to="/"
			:isActive="router.currentRoute.value.path === '/'"
		/>
		<AppSidebarNavigationItem
			icon="keymanager"
			title="Key Manager"
			to="/key-manager"
			:isActive="isActive('/key-manager')"
			:disabled="true"
			:disabledTooltip="`Available in Desktop App`"
		/>
		<AppSidebarNavigationItem
			icon="subscription"
			title="Subscription"
			to="/subscription"
			:disabled="true"
			:isActive="isActive('/subscription')"
			:disabledTooltip="`Coming Soon`"
		/>
		<!-- <AppSidebarNavigationItem
			icon="settings"
			title="Settings"
			to="/settings"
			:isActive="isActive('/settings')"
		/> -->
	</div>
</template>

<script setup lang="ts">
import AppSidebarNavigationItem from './AppSidebarNavigationItem.vue';

const router = useRouter();

const isActive = (to: string) => {
	return router.currentRoute.value.path.startsWith(to);
};
</script>

<style scoped lang="scss">
.app-main-navigation {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 0.125rem;
	@media (max-width: 640px) {
		justify-content: start;
	}
}
</style>
