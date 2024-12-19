<template>
	<SvgIcon
		class="message-status-icon"
		:icon="isRead ? 'read-message' : 'unread-message'"
	/>
</template>

<script setup lang="ts">
defineProps<{
	isRead: boolean;
}>();
</script>

<style scoped lang="scss">
.message-status-icon {
	width: 1.25rem;
	height: 1.25rem;
}
</style>
