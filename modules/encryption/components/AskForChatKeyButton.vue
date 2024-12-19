<template>
	<BaseFeatureButton
		label="Ask For A Key"
		icon="receive"
		@click="
			() => {
				console.log('ask');
			}
		"
	>
		The sufficient closeness construal says that shared features are those
		that are sufficiently quantitatively close to each other on some
		subvenient scale. In other words, models' features must be within some
		threshold range of corresponding features of the target to count as
		shared.
	</BaseFeatureButton>
</template>

<script setup lang="ts">
import BaseFeatureButton from '~/components/BaseFeatureButton.vue';
</script>

<style scoped></style>
