<template>
	<div class="separator-line">
		<div class="separator-line__line"></div>
		<slot />
		<div class="separator-line__line"></div>
	</div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.separator-line {
	display: flex;
	align-items: center;
	gap: 1rem;

	font-weight: 400;
	font-size: 0.875rem;
	line-height: 140%;
	color: rgba(255, 255, 255, 0.5);
	.separator-line__line {
		flex: 1;
		height: 0.0625rem;
		background: rgba(255, 255, 255, 0.1);
	}
}
</style>
