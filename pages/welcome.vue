<template>
	<div class="welcome-screen">
		<div class="welcome-screen__main">
			<img
				class="welcome-screen__illustration"
				src="/images/keysharer-logo.svg"
				alt=""
			/>
			<h2 class="welcome-screen__title">Key Sharer</h2>
			<p class="welcome-screen__subtitle">Secure your data</p>
		</div>
		<div class="welcome-screen__buttons">
			<BaseButton class="mb-0-75" to="/login" type="secondary">
				Login
			</BaseButton>
			<BaseButton class="mb-0-75" to="/register" type="primary">
				Create Account
			</BaseButton>
			<BaseButton class="w-full" type="as-link">
				Continue With Temporary Account
				<SvgIcon icon="arrow-right" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import SvgIcon from '~/components/SvgIcon.vue';
const { screenHeightPx } = useScreenHeight();
</script>

<style scoped lang="scss">
.welcome-screen {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: v-bind(screenHeightPx);
	overflow: auto;
	&__main {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	&__illustration {
		width: 12.5rem;
		margin-bottom: 1rem;
	}

	&__title {
		font-weight: 700;
		font-size: 3rem;
		line-height: 120%;
		text-align: center;
		letter-spacing: -0.01em;
		margin-bottom: 0.5rem;
	}

	&__subtitle {
		font-size: 1.125rem;
		line-height: 150%;
		color: rgba(255, 255, 255, 0.7);
	}

	&__buttons {
		padding: 1.5rem;
		width: min(20.4375rem, 100%);
	}
}
</style>
