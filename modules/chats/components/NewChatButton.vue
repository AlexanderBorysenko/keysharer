<template>
	<BaseButton
		class="new-chat-button"
		@click="chatCreationState.openChatCreation"
	>
		<SvgIcon icon="plus" />
		New chat
	</BaseButton>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import SvgIcon from '~/components/SvgIcon.vue';
import useChatCreationStore from '../store/useChatCreationStore';

const chatCreationState = useChatCreationStore();
</script>

<style scoped lang="scss"></style>
