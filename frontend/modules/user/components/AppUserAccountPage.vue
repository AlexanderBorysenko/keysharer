<template>
	<div class="app-user-account-page">
		<div class="app-user-account-page__head">
			<BackButton class="_mobile" @click="openSidebar" />
			<h2 class="app-user-account-page__head-title">Account Settings</h2>
			<BaseButton
				class="app-user-account-page__head-logout"
				type="secondary"
				@click="userStore.logout"
			>
				<SvgIcon icon="logout" />
				Logout
			</BaseButton>
		</div>
		<div class="app-user-account-page__main">
			<CopyButton class="mb-2" :clipboard="userStore.state.username">
				{{ userStore.state.username }}
			</CopyButton>
			<AppUserUpdateForm />
		</div>
	</div>
</template>

<script setup lang="ts">
import CopyButton from '~/components/CopyButton.vue';
import { useAppSidebarStore } from '~/modules/appSidebar/store/useAppSidebarStore';
import AppUserUpdateForm from './AppUserUpdateForm.vue';
import SvgIcon from '~/components/SvgIcon.vue';

const userStore = useUserStore();
const { open: openSidebar } = useAppSidebarStore();
</script>

<style scoped lang="scss">
.app-user-account-page {
	background: #161b26;
	display: flex;
	flex-direction: column;
	--horizontal-padding: 2rem;
	--vertical-padding: 1.5rem;
	overflow: auto;
	max-height: 100dvh;
	height: 100%;
	&__head {
		position: sticky;
		top: 0;
		height: var(--header-part-height);
		flex: 0 0 var(--header-part-height);
		border-bottom: var(--header-part-border);
		padding: 0.5rem var(--horizontal-padding);
		background: var(--bg-dark-lighter);
		display: flex;
		gap: 0.5rem;
		align-items: center;
		&-logout {
			margin-left: auto;
		}
		&-title {
			font-weight: 500;
			font-size: 1.375rem;
			line-height: 120%;
		}
	}
	&__main {
		flex: 1;
		padding: var(--vertical-padding) var(--horizontal-padding);
		max-width: 30rem;
	}
	@media (max-width: 640px) {
		--horizontal-padding: 1rem;
		--vertical-padding: 1rem;
	}
}
</style>
