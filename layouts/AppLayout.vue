<template>
	<div v-if="isAuthenticated" class="app">
		<AppNotificationsDisplayer />
		<KeepAlive>
			<AppSidebar class="sidebar" />
		</KeepAlive>
		<div class="app__main">
			<KeepAlive>
				<slot />
			</KeepAlive>
		</div>
	</div>
</template>

<script setup>
import useUserStore from '~/stores/useUserStore';
import AppSidebar from '~/modules/appSidebar/components/AppSidebar.vue';
import AppNotificationsDisplayer from '~/components/AppNotificationsDisplayer.vue';

const userStore = useUserStore();
const isAuthenticated = computed(() => !!userStore?.state?.id);
</script>

<style scoped lang="scss">
.app {
	display: grid;
	grid-template-columns: var(--header-part-height) 1fr;
	background: var(--bg-darker);
	color: #fff;
	position: fixed;
	inset: 0;
	@media (max-width: 640px) {
		display: block;
	}
}
.app__main {
	height: 100%;
}
</style>
