<template>
	<button @click="logout" class="logout-button">Logout</button>
</template>

<script setup>
import useUserStore from '~/stores/useUserStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const logout = async () => {
	try {
		await $fetch('/api/auth/logout', {
			method: 'POST'
		});
		userStore.logout(); // Clear user state
		await router.push('/login'); // Redirect to login page
	} catch (err) {
		console.error('Error during logout:', err);
	}
};
</script>

<style scoped>
.logout-button {
	background-color: #f44336;
	color: white;
	border: none;
	padding: 10px 20px;
	border-radius: 5px;
	cursor: pointer;
	font-size: 16px;
	transition: background-color 0.3s;
}

.logout-button:hover {
	background-color: #d32f2f;
}
</style>
