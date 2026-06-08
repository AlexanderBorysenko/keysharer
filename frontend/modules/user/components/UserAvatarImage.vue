<template>
	<img :src="image" v-if="image" />
	<SvgIcon v-else icon="user" />
</template>

<script setup lang="ts">
defineProps<{
	image: string | null;
}>();
</script>

<style scoped></style>
