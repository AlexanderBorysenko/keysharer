<template>
	<div class="app-sidebar" :class="{ _opened: appSidebarStore.isOpened }">
		<div class="app-sidebar__head">
			<AppLogo class="_desktop" />
			<button
				class="app-sidebar__close _mobile"
				@click="appSidebarStore.close"
			>
				<SvgIcon icon="cross" />
			</button>
			<h2 class="app-sidebar__title _mobile">Navigation</h2>
		</div>
		<AppSidebarNavigation class="app-sidebar__navigation" />
		<UserAccountNavButton
			class="app-sidebar__account-nav-button"
			@click="appSidebarStore.close"
		/>
	</div>
</template>

<script setup lang="ts">
import AppLogo from '~/components/AppLogo.vue';
import AppSidebarNavigation from './AppSidebarNavigation.vue';
import { useAppSidebarStore } from '../store/useAppSidebarStore';
import UserAccountNavButton from '~/modules/user/components/UserAccountNavButton.vue';

const appSidebarStore = useAppSidebarStore();
</script>

<style scoped lang="scss">
.app-sidebar {
	padding: 0 0.125rem;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	background: var(--bg-darker);
	flex: 1;
	&__head {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: var(--header-part-height);
		border-bottom: var(--header-part-border);
		@media (max-width: 640px) {
			justify-content: start;
			padding: 0 1.5rem;
		}
	}
	&__navigation {
		flex: 1;
		overflow: auto;
		@media (max-width: 640px) {
			padding: 1.5rem 0.5rem;
		}
	}
	&__account-nav-button {
		border-top: var(--header-part-border);
	}
	&__close {
		width: 2rem;
		height: 2rem;
		svg {
			width: 100%;
			height: 100%;
		}
	}
	&__title {
		font-weight: 500;
		font-size: 1.375rem;
		line-height: 120%;
	}
	@media (max-width: 640px) {
		position: fixed;
		inset: 0;
		z-index: 100;
		transform: translateX(-100%);
		transition: transform 0.2s;
		&._opened {
			transform: translateX(0);
		}
	}
}
</style>
