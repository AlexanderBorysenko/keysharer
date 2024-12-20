<template>
	<NuxtLayout>
		<NuxtLoadingIndicator />
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
import useUserStore from '~/stores/useUserStore';
import { onMounted } from 'vue';
import { useKeySharingStore } from './modules/encryption/store/useKeySharingStore';

const router = useRouter();
const userStore = useUserStore();

const userMiddleware = async () => {
	if (
		![
			'/login',
			'/register',
			'/forgot-password',
			'/thank-you-for-registration'
		].some(path => router.currentRoute.value.path.includes(path))
	) {
		await userStore.initializeUser();

		useKeySharingStore();
	}
};
onMounted(userMiddleware);
router.afterEach(userMiddleware);

onMounted(() => {
	document.addEventListener('visibilitychange', async () => {
		if (!userStore.state.id) return;
		await userStore.refreshToken();
	});
	setInterval(async () => {
		if (!userStore.state.id) return;
		await userStore.refreshToken();
	}, 1000 * 60 * 5);
});

useHead({
	title: 'KeySharer',
	link: [
		{ rel: 'icon', type: 'image/png', href: '/favicon.png' },
		{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
		{
			rel: 'preconnect',
			href: 'https://fonts.gstatic.com',
			crossorigin: ''
		},
		{
			rel: 'stylesheet',
			href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
		}
	]
});
</script>
