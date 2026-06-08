<template>
	<button class="app-chat-options-menu-item">
		<SvgIcon :icon="icon" class="app-chat-options-menu-item__icon" />
		<slot />
	</button>
</template>

<script setup lang="ts">
defineProps<{
	icon: string;
}>();
</script>

<style scoped lang="scss">
.app-chat-options-menu-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.7);
	transition: background 0.2s, color 0.2s;
	font-weight: 600;
	font-size: 1rem;
	line-height: 120%;
	letter-spacing: -0.01em;
	padding: 0.5rem;

	&:hover {
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 1);
	}
	&__icon {
		width: 1.25rem;
		height: 1.25rem;
	}
	@media (max-width: 640px) {
		font-weight: 600;
		font-size: 1rem;
	}
}
</style>
