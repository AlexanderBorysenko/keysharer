<template>
	<div class="call-to-action-banner" v-show="opened">
		<h3 class="call-to-action-banner__title">Pro Plan</h3>
		<button @click="close" class="call-to-action-banner__close-button">
			<SvgIcon icon="cross" class="call-to-action-banner__close-icon" />
		</button>
		<p class="call-to-action-banner__description">
			Unlock all features and feel free to chat without any limits
		</p>
		<nuxt-link to="/subscription" class="call-to-action-banner__button">
			View plan
		</nuxt-link>
	</div>
</template>

<script setup lang="ts">
const opened = ref(true);

const close = () => {
	opened.value = false;
};
</script>

<style scoped lang="scss">
.call-to-action-banner {
	padding: 1rem;
	gap: 1.5rem;
	background: url('~/assets/images/cta-background.jpg') no-repeat center
		center;
	background-size: cover;
	border-radius: 0.75rem;
	padding: 1rem;
	position: relative;
	&__close-button {
		position: absolute;
		width: 2.5rem;
		height: 2.5rem;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: 0.5rem;
		transition: background 0.2s;
		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}
	&__close-icon {
		width: 1.25rem;
		height: 1.25rem;
	}
	&__title {
		font-weight: 600;
		font-size: 1.25rem;
		line-height: 120%;
		margin-bottom: 0.5rem;
	}
	&__description {
		font-weight: 400;
		font-size: 1rem;
		line-height: 150%;
		opacity: 0.8;
		margin-bottom: 1.5rem;
	}
	&__button {
		display: block;
		text-align: center;
		padding: 0.5rem 0.75rem;
		background: #ffffff;
		border: 0.0625rem solid rgba(255, 255, 255, 0.08);
		color: #0c111d;
		border-radius: 0.75rem;
		transition: background 0.2s, color 0.2s;
		&:hover {
			background: var(--purple);
			color: #fff;
		}
	}
}
</style>
