<template>
	<svg class="svg-icon">
		<use :href="`/images/icons.svg#${icon}`"></use>
	</svg>
</template>

<script setup lang="ts">
defineProps<{
	icon: string;
}>();
</script>

<style scoped lang="scss">
.svg-icon {
	width: 100%;
	height: 100%;
}
</style>
