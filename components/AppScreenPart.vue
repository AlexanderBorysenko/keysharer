<template>
	<div
		class="app-screen-part"
		:class="{
			_opened: opened
		}"
	>
		<div class="app-screen-part__head">
			<slot name="head"></slot>
		</div>
		<div class="app-screen-part__main">
			<slot name="main"></slot>
		</div>
		<div v-if="$slots.footer" class="app-screen-part__footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	opened: boolean;
}>();
</script>

<style scoped lang="scss">
.app-screen-part {
	background: #161b26;
	display: flex;
	flex-direction: column;
	--horizontal-padding: 2rem;
	--vertical-padding: 1.5rem;
	max-height: 100vh;
	height: auto;
	@supports (height: 100dvh) {
		max-height: 100dvh;
	}
	&__head {
		height: var(--header-part-height);
		border-bottom: var(--header-part-border);
		padding: 0.5rem var(--horizontal-padding);
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	&__main {
		flex: 1;
		overflow: auto;
	}
	&__footer {
		display: flex;
		gap: 0.75rem;
		border-top: var(--header-part-border);
		padding: var(--vertical-padding) var(--horizontal-padding);
		& > * {
			flex: 1;
		}
	}
	@media (max-width: 640px) {
		position: fixed;
		inset: 0;
		z-index: 12;
		transform: translateX(100%);
		transition: transform 0.2s;
		--horizontal-padding: 1rem;
		--vertical-padding: 1rem;
		&._opened {
			transform: translateX(0);
		}
	}
}
</style>
