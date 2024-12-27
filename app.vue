<template>
	<NuxtLayout>
		<NuxtLoadingIndicator />
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
const { requestPermission } = useSystemNotifications();
onMounted(() => {
	requestPermission();
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
