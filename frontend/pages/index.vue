<template>
	<AppLayout>
		<AppChattingArea />
	</AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue';
import AppChattingArea from '~/modules/chats/components/AppChattingArea.vue';

useHead({
	title: 'KeySharer - Chats'
});
definePageMeta({
	middleware: 'auth'
});
</script>

<style scoped></style>
