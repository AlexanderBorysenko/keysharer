<template>
	<nuxt-link
		:to="!disabled ? to : undefined"
		:title="disabled ? disabledTooltip : undefined"
		:class="[
			'app-navigation-item',
			{
				_active: isActive,
				_disabled: disabled
			}
		]"
		@click="appSidebarStore.close"
	>
		<SvgIcon :icon="icon" class="app-navigation-item__icon" />
		<span class="app-navigation-item__title">{{ title }}</span>
	</nuxt-link>
</template>

<script setup lang="ts">
import SvgIcon from '~/components/SvgIcon.vue';
import { useAppSidebarStore } from '../store/useAppSidebarStore';
const appSidebarStore = useAppSidebarStore();

defineProps<{
	title: string;
	icon: string;
	to: string;
	isActive: boolean;
	disabled?: boolean;
	disabledTooltip?: string;
}>();
</script>

<style scoped lang="scss">
.app-navigation-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	height: 5rem;
	border-radius: 0.75rem;
	color: rgba(255, 255, 255, 0.7);
	transition: background 0.2s, color 0.2s;
	text-align: center;
	&._active {
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 1);
	}
	&._disabled {
		cursor: not-allowed;
		opacity: 0.5;
		&:hover {
			background: none;
			color: rgba(255, 255, 255, 0.7);
		}
	}
	&:hover {
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 1);
	}
	&__icon {
		width: 1.5rem;
		height: 1.5rem;
		@media (max-width: 640px) {
			width: 2rem;
			height: 2rem;
		}
	}
	&__title {
		font-weight: 600;
		font-size: 0.6875rem;
		line-height: 120%;
		letter-spacing: -0.01em;
		@media (max-width: 640px) {
			font-weight: 600;
			font-size: 1.25rem;
			line-height: 120%;
		}
	}
	@media (max-width: 640px) {
		flex-direction: row;
		justify-content: start;
		padding: 1.5rem 1.25rem;
	}
}
</style>
