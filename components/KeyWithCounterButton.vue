<template>
	<button class="key-with-counter-button" :class="{ _alert: counter }">
		<span class="key-with-counter-button__counter" v-if="counter">
			{{ counter }}
		</span>
		<SvgIcon icon="key" />
	</button>
</template>

<script setup lang="ts">
const props = defineProps<{
	counter?: number;
}>();
</script>

<style scoped lang="scss">
.key-with-counter-button {
	width: 1em;
	height: 1em;
	color: rgba(255, 255, 255, 0.7);
	position: relative;
	&:hover {
		color: rgba(255, 255, 255, 1);
	}
	&._alert {
		animation: pulsing 2s infinite;
		color: #fff;
	}
	svg {
		width: 100%;
		height: 100%;
	}
	&__counter {
		position: absolute;
		top: -0.5em;
		left: -0.75em;
		background: var(--purple);
		color: #fff;
		border-radius: 50%;
		width: 1.4em;
		height: 1.4em;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 100%;
		font-size: 0.5em;
	}
}
</style>
