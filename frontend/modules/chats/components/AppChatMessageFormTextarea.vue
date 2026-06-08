<template>
	<div class="message-form-textarea">
		<textarea
			:rows="rowsCount"
			v-model="model"
			type="text"
			placeholder=""
			class="message-input"
			ref="textareaRef"
			@keydown.enter.prevent="handleEnter"
			@keydown.shift.enter="handleShiftEnter"
			@paste="onPaste"
		/>
	</div>
</template>

<script setup lang="ts">
import { useMessageFormStore } from '../store/useMessageFormStore';

const model = defineModel<string>({
	required: true
});
const props = defineProps<{
	onEnter: () => void;
}>();

const messageFormStore = useMessageFormStore();
const onPaste = (event: ClipboardEvent) => {
	messageFormStore.filePasteEventHandler(event);
	if (!event.clipboardData?.getData('text')) event.preventDefault();
};

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const getTextWidth = (text: string, font: string) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (context) {
		context.font = font;
		return context.measureText(text).width;
	}
	return 0;
};

const updateRowsCount = () => {
	const textarea = textareaRef.value;
	if (!textarea) return 1;
	if (model.value.length === 0) return 1;

	const font = window.getComputedStyle(textarea).font;
	const textareaWidth = textarea.clientWidth;
	const symbolWidth = getTextWidth('a', font);

	const lines = model.value.split('\n').reduce((acc, line) => {
		const lineWidth = getTextWidth(line, font) || symbolWidth;
		return acc + Math.ceil(lineWidth / textareaWidth);
	}, 0);

	return Math.min(lines, 5);
};

const rowsCount = computed(() => updateRowsCount());

const handleShiftEnter = (event: KeyboardEvent) => {
	if (event.key === 'Enter' && event.shiftKey) {
		event.preventDefault();
		const textarea = textareaRef.value;
		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			model.value =
				model.value.substring(0, start) +
				'\n' +
				model.value.substring(end);
			nextTick(() => {
				textarea.selectionStart = textarea.selectionEnd = start + 1;
			});
		} else {
			model.value += '\n';
		}
	}
};
const handleEnter = (event: KeyboardEvent) => {
	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault();
		props.onEnter();
	}
};
</script>

<style scoped lang="scss">
.message-form-textarea {
	flex: 1;
}
.message-input {
	flex: 1;
	width: 100%;
	border: none;
	background: transparent;
	color: #fff;
	font-size: 1rem;
	outline: none;
	resize: none;
	font-size: max(16px, 1rem);
	padding: 0.25rem 0;
	@media (max-width: 640px) {
	}
}

.key-alert {
	flex: 1;
	font-size: 1rem;
	color: rgba($color: #fff, $alpha: 0.8);
	@media (max-width: 640px) {
		font-size: 0.75rem;
	}
}

.message-input::placeholder {
	color: #888;
}
</style>
