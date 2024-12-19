<template>
	<div class="base-password-input" :class="{ _error: error }">
		<input
			v-if="!textarea"
			ref="passwordInput"
			:type="isPasswordVisible ? 'text' : 'password'"
			v-model="model"
			class="base-password-input__input"
			:placeholder="placeholder ?? ''"
			:disabled="disabled"
			:name="name"
		/>
		<textarea
			v-else
			ref="passwordInput"
			v-model="model"
			class="base-password-input__input"
			:placeholder="placeholder ?? ''"
			:disabled="disabled"
			:name="name"
		/>
		<button
			type="button"
			class="base-password-input__toggle-button"
			@click="togglePasswordVisibility"
		>
			<SvgIcon :icon="isPasswordVisible ? 'eye-off' : 'eye'" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import SvgIcon from './SvgIcon.vue';

const model = defineModel<string>();

const props = defineProps<{
	placeholder?: string;
	name?: string;
	error?: boolean;
	disabled?: boolean;
	textarea?: boolean;
	onInput?: (value: string) => void;
}>();

const isPasswordVisible = ref(false);
const passwordInput = ref<HTMLInputElement | null>(null);

const togglePasswordVisibility = () => {
	isPasswordVisible.value = !isPasswordVisible.value;
	nextTick(() => {
		if (passwordInput.value) {
			passwordInput.value.setSelectionRange(
				passwordInput.value.value.length,
				passwordInput.value.value.length
			);
		}
	});
};

watch(
	() => model.value,
	value => {
		if (props.onInput) {
			props.onInput(value || '');
		}
	}
);
</script>

<style scoped lang="scss">
.base-password-input {
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

.base-password-input__input {
	flex: 1;
	padding-right: 0.5rem; /* Adjust based on the button size */
	background: none;
	border: none;
	color: white;
	font-size: 1rem;
	outline: none;
	resize: none;
}

.base-password-input__toggle-button {
	width: 1.25rem;
	height: 1.25rem;
	svg {
		width: 100%;
		height: 100%;
	}
}
</style>
