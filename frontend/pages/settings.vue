<template>
	<AppLayout>
		<div class="settings">
			<h1>Settings</h1>
		</div>
	</AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue';
definePageMeta({
	middleware: ['auth']
});
</script>

<style scoped></style>
