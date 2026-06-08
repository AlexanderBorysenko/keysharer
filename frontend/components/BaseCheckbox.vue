<template>
	<label class="base-checkbox">
		<input type="checkbox" v-model="model" class="base-checkbox__input" />
		<span class="base-checkbox__box"></span>
		<slot />
	</label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({
	required: true
});
</script>

<style scoped lang="scss">
.base-checkbox {
	display: flex;
	align-items: center;
	cursor: pointer;
	gap: 0.5rem;
	user-select: none;

	&__input {
		display: none;
	}

	&__box {
		width: 1rem;
		height: 1rem;
		border: 0.125rem solid rgba(255, 255, 255, 0.5);
		border-radius: 0.25rem;
		background: none;
		position: relative;
		transition: background 0.2s, border-color 0.2s;
	}

	&__input:checked + &__box {
		background: var(--purple);
		border-color: var(--purple);
	}

	&__box::after {
		content: '';
		position: absolute;
		top: 0.125rem;
		left: 0.25rem;
		width: 0.25rem;
		height: 0.5rem;
		border: solid white;
		border-width: 0 0.125rem 0.125rem 0;
		transform: rotate(45deg);
		opacity: 0;
		transition: opacity 0.2s;
	}

	&__input:checked + &__box::after {
		opacity: 1;
	}
}
</style>
