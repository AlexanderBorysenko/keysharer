<template>
	<SvgIcon icon="refresh" class="refreshing-spinner" />
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
.refreshing-spinner {
	animation: spin 1s linear infinite;
}
</style>
