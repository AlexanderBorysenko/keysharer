<template>
	<button class="copy-button" @click="copyToClipboard">
		<span class="copy-button__text">
			<slot></slot>
		</span>
		<SvgIcon icon="copy" class="copy-button__icon" />
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
	box-sizing: border-box;
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 1rem;
	gap: 0.5rem;
	border: 0.0625rem solid rgba(255, 255, 255, 0.08);
	border-radius: 0.75rem;

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
