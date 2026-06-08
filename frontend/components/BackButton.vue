<template>
	<button class="back-button" v-if="!to">
		<span class="back-button__counter" v-if="counter">
			{{ counter }}
		</span>
		<SvgIcon icon="arrow-left" />
	</button>
	<router-link v-else :to="to" class="back-button">
		<span class="back-button__counter" v-if="counter">
			{{ counter }}
		</span>
		<SvgIcon icon="arrow-left" />
	</router-link>
</template>

<script setup lang="ts">
import SvgIcon from './SvgIcon.vue';

defineProps<{
	to?: string;
	counter?: number;
}>();
</script>

<style scoped lang="scss">
.back-button {
	width: 2rem;
	height: 2rem;
	display: block;
	position: relative;
	svg {
		width: 100%;
		height: 100%;
	}
	&__counter {
		position: absolute;
		top: -0.75em;
		left: -0.75em;
		background: var(--purple);
		color: #fff;
		border-radius: 50%;
		width: 1.65em;
		height: 1.65em;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 100%;
		font-size: 0.65em;
	}
	@media (max-width: 640px) {
		width: 1.5rem;
		height: 1.5rem;
	}
}
</style>
