<template>
	<button class="back-button" v-if="!to">
		<SvgIcon icon="arrow-left" />
	</button>
	<router-link v-else :to="to" class="back-button">
		<SvgIcon icon="arrow-left" />
	</router-link>
</template>

<script setup lang="ts">
import SvgIcon from './SvgIcon.vue';

defineProps<{
	to?: string;
}>();
</script>

<style scoped lang="scss">
.back-button {
	width: 2rem;
	height: 2rem;
	display: block;
	svg {
		width: 100%;
		height: 100%;
	}
	@media (max-width: 640px) {
		width: 1.5rem;
		height: 1.5rem;
	}
}
</style>
