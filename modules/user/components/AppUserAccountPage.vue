<template>
	<div class="app-chat-key-settings">
		<div class="app-chat-key-settings__head">
			<BackButton class="_mobile" @click="openSidebar" />
			<h2 class="app-chat-key-settings__head-title">Account Settings</h2>
		</div>
		<div class="app-chat-key-settings__main">
			<h1 class="mb-2 fs-2">
				<CopyButton :clipboard="userStore.state.username">
					{{ userStore.state.username }}
				</CopyButton>
			</h1>
			<AppUserUpdateForm />
			<BaseButton type="secondary" @click="userStore.logout">
				Logout
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import CopyButton from '~/components/CopyButton.vue';
import { useAppSidebarStore } from '~/modules/appSidebar/store/useAppSidebarStore';
import AppUserUpdateForm from './AppUserUpdateForm.vue';

const userStore = useUserStore();
const { open: openSidebar } = useAppSidebarStore();
</script>

<style scoped lang="scss">
.app-chat-key-settings {
	background: #161b26;
	display: flex;
	flex-direction: column;
	--horizontal-padding: 2rem;
	--vertical-padding: 1.5rem;
	height: 100%;
	&__head {
		height: var(--header-part-height);
		border-bottom: var(--header-part-border);
		padding: 0.5rem var(--horizontal-padding);
		display: flex;
		gap: 0.5rem;
		align-items: center;
		&-title {
			font-weight: 500;
			font-size: 1.375rem;
			line-height: 120%;
		}
	}
	&__main {
		flex: 1;
		overflow: auto;
		padding: var(--vertical-padding) var(--horizontal-padding);
	}
	@media (max-width: 640px) {
		--horizontal-padding: 1rem;
		--vertical-padding: 1rem;
	}
}
</style>
