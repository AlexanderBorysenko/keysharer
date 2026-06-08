<template>
	<button @click="generateRandomString" class="generate-random-key-button">
		<SvgIcon icon="refresh" />
		Auto-generate
	</button>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

const emit = defineEmits<{
	(e: 'generated', randomString: string): void;
}>();

function generateRandomString() {
	const chars =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
	let randomString = '';
	while (
		!/[A-Z]/.test(randomString) ||
		!/[a-z]/.test(randomString) ||
		!/[0-9]/.test(randomString) ||
		!/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(randomString)
	) {
		randomString = Array.from(
			{ length: 24 },
			() => chars[Math.floor(Math.random() * chars.length)]
		).join('');
	}
	emit('generated', randomString);
}
</script>

<style scoped lang="scss">
.generate-random-key-button {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0.25rem 0.5rem;
	gap: 0.25rem;
	background: rgba(255, 255, 255, 0.1);
	border: 0.0625rem solid rgba(255, 255, 255, 0.08);
	border-radius: 0.5rem;
	transition: background 0.3s ease;
	svg {
		width: 1rem;
		height: 1rem;
	}
	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}
}
</style>
