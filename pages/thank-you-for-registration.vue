<template>
	<div class="thank-you-for-registration">
		<div class="thank-you-for-registration__main">
			<img
				class="thank-you-for-registration__illustration mb-1"
				src="/images/keysharer-logo.svg"
				alt=""
			/>
			<h1 class="fs-3 mb-1">Thank you for choosing us!</h1>
			<p class="text-07 fs-1-5">Your account is waiting for you</p>
		</div>
		<div class="thank-you-for-registration__footer">
			<BaseButton to="/login" type="primary">Lets Goo ;)</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
</script>

<style scoped lang="scss">
@use '~/styles/vars.scss' as *;
.thank-you-for-registration {
	height: 100vh;
	display: flex;
	flex-direction: column;
	@media (min-width: $mobile-width) {
		justify-content: center;
	}
	&__illustration {
		width: 18.75rem;
	}
	&__main {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		@media (min-width: $mobile-width) {
			margin-bottom: 2rem;
		}
		@media (max-width: $mobile-width) {
			flex: 1;
		}
	}
	&__footer {
		padding: 1.5rem;
		margin-left: auto;
		margin-right: auto;
		max-width: 23.4375rem;
		width: 100%;
	}
}
</style>
