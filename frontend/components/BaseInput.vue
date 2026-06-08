<template>
	<div class="base-input" :class="{ _error: error }">
		<input
			ref="passwordInput"
			:type="type"
			v-model="model"
			class="base-input__input"
			:placeholder="placeholder ?? ''"
			:disabled="disabled"
		/>
		<slot name="controls" />
	</div>
</template>

<script setup lang="ts">
const model = defineModel<string | null>();

const props = defineProps<{
	placeholder?: string;
	type?: string;
	name?: string;
	error?: boolean;
	disabled?: boolean;
	onInput?: (value: string) => void;
}>();

watch(model, value => {
	if (props.onInput) props.onInput(value || '');
});
</script>

<style scoped lang="scss">
.base-input {
	display: flex;
	align-items: center;
	padding: 0.75rem 1rem;
	gap: 0.5rem;
	background: rgba(255, 255, 255, 0.1);
	border: 0.0625rem solid rgba(255, 255, 255, 0.08);
	border-radius: 0.75rem;
	&._error {
		border-color: var(--danger);
	}
}

.base-input__input {
	flex: 1;
	padding-right: 0.5rem; /* Adjust based on the button size */
	background: none;
	border: none;
	color: white;
	font-size: 1rem;
	outline: none;
}
</style>
