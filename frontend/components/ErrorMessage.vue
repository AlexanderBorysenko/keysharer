<template>
	<div class="error-message">
		<SvgIcon icon="alert" />
		<slot />
	</div>
</template>

<script setup lang="ts">
import SvgIcon from './SvgIcon.vue';
</script>

<style scoped lang="scss">
.error-message {
	display: flex;
	gap: 0.375rem;
	font-size: 0.875rem;
}
</style>
