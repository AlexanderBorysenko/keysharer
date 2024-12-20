<template>
	<AppLayout>
		<AppUserAccountPage />
	</AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue';
import AppUserAccountPage from '~/modules/user/components/AppUserAccountPage.vue';
const { logout } = useUserStore();
</script>

<style scoped></style>
