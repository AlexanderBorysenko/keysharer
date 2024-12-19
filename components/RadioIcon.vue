<template>
	<svg
		width="17"
		height="17"
		viewBox="0 0 17 17"
		fill="none"
		:class="[
			'radio-icon',
			className,
			{
				_active: props.checked
			}
		]"
	>
		<rect
			x="1.15"
			y="1.15"
			width="14.7"
			height="14.7"
			rx="7.35"
			stroke="currentColor"
			stroke-width="1.3"
			class="radio-icon__outer-circle"
		/>
		<circle
			cx="8.5"
			cy="8.5"
			r="4"
			fill="transparent"
			class="radio-icon__inner-circle"
		/>
	</svg>
</template>

<script setup lang="ts">
const props = defineProps<{
	checked: boolean;
	class?: string;
}>();

const className = ref(props.class);
</script>

<style scoped lang="scss">
.radio-icon {
	opacity: 0.7;
	&__inner-circle {
		transition: fill 0.2s;
		fill: transparent;
	}
	&:hover {
		opacity: 1;
	}
	&._active &__inner-circle {
		fill: currentColor;
	}
}
</style>
