<template>
	<button
		v-if="!to"
		:class="classes"
		:disabled="disabled"
		:title="disabledReason"
	>
		<slot />
	</button>
	<NuxtLink
		v-else
		:class="classes"
		:to="to"
		:disabled="disabled"
		:title="disabledReason"
	>
		<slot />
	</NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
	type?: 'secondary' | 'primary' | 'danger' | 'success' | 'as-link';
	large?: boolean;
	block?: boolean;
	disabled?: boolean;
	disabledReason?: string;
	to?: string;
}>();

const classes = computed(() => {
	return {
		'base-button': true,
		[props.type ?? 'primary']: true,
		large: props.large,
		block: props.block
	};
});
</script>

<style scoped lang="scss">
.base-button {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	--padding-vertical: 0.5rem;
	&.large {
		--padding-vertical: 0.625rem;
	}
	padding: var(--padding-vertical) 0.75rem var(--padding-vertical) 0.75rem;
	gap: 0.5rem;
	border-radius: 0.75rem;
	font-weight: 600;
	font-size: 0.875rem;
	line-height: 140%;
	transition: background 0.2s, border-color 0.2s;
	:deep(svg, img) {
		width: 1.5rem;
		height: 1.5rem;
	}
	border: 0.0625rem solid transparent;
	&.primary {
		background: var(--purple);
		color: #fff;
		border-color: var(--purple);
		&:not(:disabled):hover {
			background: var(--purple-dark);
		}
	}
	&.secondary {
		background: transparent;
		color: #fff;
		border-color: #fff;
		&:not(:disabled):hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}
	&.as-link {
		border: none;
		text-decoration: underline;
	}
	&:disabled {
		filter: grayscale(1);
		cursor: not-allowed;
	}
}
</style>
