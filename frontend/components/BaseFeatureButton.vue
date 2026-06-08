<template>
	<div class="feature-button">
		<div class="feature-button__header">
			<button @click="toggleExpand" class="expand-button">
				<SvgIcon class="icon" :icon="expanded ? 'cross' : 'info'" />
			</button>
			<span @click="onClick">{{ label }}</span>
			<button
				@click="onClick"
				class="execute-button"
				:disabled="disabled"
				:title="disabled ? disabledMessage : undefined"
			>
				<SvgIcon class="icon" :icon="icon ?? 'arrow-up-right'" />
			</button>
		</div>
		<div v-if="expanded" class="feature-button__content">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import SvgIcon from './SvgIcon.vue';

const props = defineProps<{
	label: string;
	initialExpanded?: boolean;
	icon?: string;
	onClick: () => void;
	disabled?: boolean;
	disabledMessage?: string;
}>();

const expanded = ref(props.initialExpanded ?? false);

function toggleExpand() {
	expanded.value = !expanded.value;
}
</script>

<style scoped lang="scss">
.feature-button {
	border: 0.0625rem solid #ccc;
	border-radius: 0.5rem;
	padding: 0.75rem 1rem 0.75rem 1rem;
	svg {
		width: 1.5rem;
		height: 1.5rem;
	}
}

.feature-button__header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.expand-button {
	width: 1.25rem;
	height: 1.25rem;
	svg {
		width: 100%;
		height: 100%;
	}
}

.execute-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	background: #5645ee;
	margin-left: auto;
	background: #5645ee;
	border: 0.0625rem solid rgba(255, 255, 255, 0.08);
	border-radius: 0.375rem;
	transition: background 0.2s;
	svg {
		width: 1.25rem;
		height: 1.25rem;
	}
	&:not(:disabled):hover {
		background: #6f5ff5;
	}
	&:disabled {
		filter: grayscale(1);
		cursor: not-allowed;
	}
}

.feature-button__content {
	padding-top: 0.5rem;
	margin-top: 0.5rem;
	border-top: 0.0625rem solid rgba(255, 255, 255, 0.5);
	font-size: 0.875rem;
	line-height: 140%;
	color: rgba(255, 255, 255, 0.7);
}
</style>
