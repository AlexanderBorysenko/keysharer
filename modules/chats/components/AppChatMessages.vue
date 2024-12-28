<template>
	<div
		class="app-chat-messages"
		:class="{
			'loading-more': isLoadingMoreMessages,
			'is-switching-chat': isSwitchingChat
		}"
		ref="elementRef"
	>
		<div class="app-chat-messages__inner" ref="innerRef">
			<AppChatMessage
				v-for="message in chatStore.chatState.messages"
				:key="message.id"
				:message="message"
				@mounted="onMessageMounted"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '../store/useChatStore';
import AppChatMessage from './AppChatMessage.vue';
import { storeToRefs } from 'pinia';

const chatStore = useChatStore();
const { loadMoreMessages } = chatStore;
const { isLastPage, isLoadingMoreMessages, isLoadingChat } =
	storeToRefs(chatStore);

const elementRef = ref<HTMLElement | null>(null);
const innerRef = ref<HTMLElement | null>(null);

onMounted(() => {
	if (elementRef.value) {
		setTimeout(() => {
			elementRef.value?.scrollTo({
				top: elementRef.value.scrollHeight,
				behavior: 'instant'
			});
		}, 0);
		elementRef.value.addEventListener('scroll', () => {
			const wrapperRect = elementRef.value?.getBoundingClientRect();
			const innerRect = innerRef.value?.getBoundingClientRect();
			if (
				!wrapperRect ||
				!innerRect ||
				isLastPage.value ||
				isLoadingChat.value ||
				isLoadingMoreMessages.value
			)
				return;
			if (wrapperRect.top < innerRect.top) {
				loadMoreMessages();
			}
		});
	}
});

const isSwitchingChat = ref(false);
watch(
	() => isLoadingChat.value,
	() => {
		if (isLoadingChat.value) {
			isSwitchingChat.value = true;
			return;
		}
		setTimeout(() => {
			elementRef.value?.scrollTo({
				top: elementRef.value.scrollHeight,
				behavior: 'instant'
			});
			isSwitchingChat.value = false;
		}, 0);
	}
);

let previousScrollHeight = 0;
watch(isLoadingMoreMessages, () => {
	if (!elementRef.value) return;
	if (isLoadingMoreMessages.value) {
		previousScrollHeight = elementRef.value?.scrollHeight || 0;
		innerRef.value!.style.height = `${previousScrollHeight}px`;
	} else {
		setTimeout(() => {
			innerRef.value!.style.height = 'auto';
			const newScrollHeight = elementRef.value?.scrollHeight || 0;
			elementRef.value?.scrollTo({
				top: newScrollHeight - previousScrollHeight,
				behavior: 'instant'
			});
		}, 0);
	}
});

const onMessageMounted = () => {
	if (!elementRef.value || !innerRef.value || isLoadingChat.value) return;

	const wrapperRect = elementRef.value?.getBoundingClientRect();
	const innerRect = innerRef.value?.getBoundingClientRect();
	const scrollPosition = wrapperRect.bottom - innerRect.bottom;
	const viewportHeight = window.innerHeight;
	const scrollBottom = scrollPosition + viewportHeight * 0.5;
	if (scrollBottom < 0) return;
	setTimeout(() => {
		elementRef.value?.scrollTo({
			top: elementRef.value.scrollHeight,
			behavior: 'smooth'
		});
	}, 100);
};
</script>

<style scoped lang="scss">
.app-chat-messages {
	overflow-y: auto;
	padding: 1.5rem 1rem;
	transition: all 0.3s ease;
	&.loading-more {
		pointer-events: none;
		opacity: 0.5;
	}
	&.is-switching-chat {
		opacity: 0;
	}
	&__inner {
		overflow: hidden;
		height: max-content;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
}
</style>
