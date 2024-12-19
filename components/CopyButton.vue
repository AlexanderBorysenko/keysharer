<template>
	<button class="copy-button" @click="copyToClipboard">
		<SvgIcon icon="copy" class="copy-button__icon" />
		<span class="copy-button__text">
			<slot></slot>
		</span>
	</button>
</template>

<script setup lang="ts">
const notifications = useAppNotificationsStore();
const props = defineProps<{
	clipboard: string;
}>();

function copyToClipboard() {
	try {
		navigator.clipboard.writeText(props.clipboard);
		notifications.addNotification({
			type: 'success',
			icon: 'success',
			message: 'Copied to clipboard'
		});
	} catch (error) {
		notifications.addNotification({
			type: 'error',
			icon: 'error',
			message: 'Failed to copy to clipboard'
		});
	}
}
</script>

<style scoped lang="scss">
.copy-button {
	font-size: 1em;
	display: flex;
	align-items: center;
	gap: 0.25em;
	background: rgba(255, 255, 255, 0.1);
	padding: 0.5em;
	border-radius: 0.5em;
	&:hover {
		cursor: pointer;
		text-decoration: underline;
	}
	&__icon {
		width: 1.25em;
		height: 1.25em;
	}
}
</style>
