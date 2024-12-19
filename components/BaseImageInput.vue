<template>
	<div class="base-image-input">
		<input
			type="file"
			accept="image/png, image/jpeg, image/jpg"
			@change="onFileChange"
			:disabled="disabled"
			class="base-image-input__input"
			ref="inputRef"
		/>
		<div
			class="base-image-input__preview"
			v-if="previewUrl || previousImageUrl"
		>
			<img :src="previewUrl || previousImageUrl" alt="Image preview" />
		</div>
		<span class="base-image-input__label" @click="inputRef?.click()">
			Select Image
		</span>
	</div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

const props = defineProps<{
	disabled?: boolean;
	onInput?: (file: File | null) => void;
	previousImageUrl?: string;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const model = defineModel<File | null>();

const previewUrl = ref<string | null>(null);

function onFileChange(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0] || null;
	if (file) {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			previewUrl.value = reader.result as string;
		};
		model.value = file;
	} else {
		previewUrl.value = null;
		model.value = null;
	}
	if (props.onInput) {
		props.onInput(file);
	}
}
</script>

<style scoped lang="scss">
.base-image-input {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	.base-image-input__input {
		display: none;
	}
	.base-image-input__label {
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 0.0625rem solid rgba(255, 255, 255, 0.08);
		border-radius: 0.75rem;
		color: white;
		cursor: pointer;
	}
	.base-image-input__preview {
		width: 5rem;
		height: 5rem;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
			border-radius: 0.75rem;
		}
	}
}
</style>
