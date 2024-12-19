<template>
	<div
		class="app-chat"
		:class="{ _opened: chatStore.isOpened, _drag: isDragging }"
		@dragover.prevent="onDragOver"
		@drop="onDrop"
		@dragleave="isDragging = false"
	>
		<AppChatHead />
		<AppChatSettings />
		<AppChatDeletion />
		<AppChatMessages class="app-chat__messages" />
		<div class="app-chat__message-field-wrapper">
			<AppChatMessageForm />
		</div>
		<TransitionGroup name="fade">
			<div class="dragging-frame" v-if="isDragging">
				<div class="dragging-frame__inner">
					<SvgIcon icon="file-send" class="dragging-frame__icon" />
				</div>
			</div>
		</TransitionGroup>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '../store/useChatStore';
import { useMessageFormStore } from '../store/useMessageFormStore';
import AppChatDeletion from './AppChatDeletion.vue';
import AppChatHead from './AppChatHead.vue';
import AppChatMessageForm from './AppChatMessageForm.vue';
import AppChatMessages from './AppChatMessages.vue';
import AppChatSettings from './AppChatSettings.vue';

const chatStore = useChatStore();
const { fileDropEventHandler } = useMessageFormStore();

const isDragging = ref(false);

const onDragOver = () => {
	isDragging.value = true;
};

const onDrop = (event: DragEvent) => {
	isDragging.value = false;
	fileDropEventHandler(event);
};
</script>

<style scoped lang="scss">
.app-chat {
	display: flex;
	flex-direction: column;
	height: 100vh !important;
	background: #0c111d;
	position: relative;
	&__messages {
		flex-grow: 1;
		flex-shrink: 1;
	}
	&__message-field-wrapper {
		padding: 0 1.5rem 1.5rem 1.5rem;
		@media (max-width: 640px) {
			padding: 0.5rem;
		}
	}
	&__back-button {
		width: 2rem;
		height: 2rem;
		svg {
			width: 100%;
			height: 100%;
		}
	}
	@media (max-width: 640px) {
		position: fixed;
		inset: 0;
		z-index: 11;
	}
}
.dragging-frame {
	position: absolute;
	inset: 0;
	background: rgba($color: #5645ee, $alpha: 0.6);
	padding: 2rem;
	&__inner {
		border-radius: 3rem;
		border: 0.25rem dashed #fff;
		height: 100%;
	}
	&__icon {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 15%;
		height: 15%;
		transform: translate(-50%, -50%);
	}
}
</style>
