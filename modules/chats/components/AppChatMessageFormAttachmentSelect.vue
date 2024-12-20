<template>
	<div>
		<input
			type="file"
			class="hidden-file-input"
			@change="onFileChange"
			ref="fileInput"
			style="display: none"
			multiple
		/>
		<button class="attachment-button" @click="triggerFileInput">
			<SvgIcon icon="attachment" class="icon" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { useMessageFormStore } from '../store/useMessageFormStore';
const messageFormStore = useMessageFormStore();
const fileInput = ref<HTMLInputElement | null>(null);

const onFileChange = (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files.length > 0) {
		Array.from(input.files).forEach(file => {
			messageFormStore.addFile(file);
		});
	}
};

const triggerFileInput = () => {
	if (fileInput.value) {
		fileInput.value.click();
	}
};

// watch(files, newFiles => {
// 	if (newFiles.length > 0) {
// 		// Handle file attachment logic here
// 	}
// });
</script>

<style scoped lang="scss">
.attachment-button {
	width: 2.5rem;
	height: 2.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	border: none;
	color: rgba(255, 255, 255, 0.5);
	border-radius: 0.625rem;
	transition: color 0.2s, background 0.2s;
	&:not(:disabled):hover {
		color: #fff;
	}
	&.is-active {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}
	.icon {
		width: 1.5rem;
		height: 1.5rem;
	}
}
</style>
