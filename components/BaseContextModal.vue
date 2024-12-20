<template>
	<div v-if="isOpened" class="base-context-modal" ref="modalElement">
		<div class="base-context-modal__body">
			<button
				class="base-context-modal__close-button"
				@click="() => emit('close')"
			>
				<SvgIcon icon="cross" class="base-context-modal__close-icon" />
			</button>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	isOpened: boolean;
}>();

const modalElement = ref<HTMLElement | null>(null);

const outsideClickHandler = (event: MouseEvent) => {
	if (!modalElement.value) return false;
	if (modalElement.value === (event.target as Node)) {
		emit('close');
	}
};

watchEffect(() => {
	modalElement.value?.addEventListener('click', outsideClickHandler);
});

const emit = defineEmits<{
	(e: 'close'): void;
}>();
</script>

<style scoped lang="scss">
.base-context-modal {
	position: absolute;
	inset: 0 !important;
	z-index: 10;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 0.5rem;

	background: rgba(12, 17, 29, 0.5);
	backdrop-filter: blur(1.25rem);

	&__body {
		max-height: calc(100% - 2rem);
		background: #161b26;
		border: var(--ui-light-border);
		box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(255, 255, 255, 0.04);
		border-radius: 0.75rem;
		width: min(25rem, calc(100% - 2rem));
		position: relative;
	}
	&__close-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 2.75rem;
		height: 2.75rem;
		position: absolute;
		z-index: 2;
		top: 1.5rem;
		right: 1rem;
		transition: background 0.2s, color 0.2s;
		border-radius: 0.5rem;
		color: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(1.25rem);
		&:hover {
			background: rgba(255, 255, 255, 0.1);
			color: rgba(255, 255, 255, 1);
		}
	}
	&__close-icon {
		width: 1.5rem;
		height: 1.5rem;
	}
}
</style>
