<template>
	<div class="login">
		<div class="login__inner-wrapper">
			<div class="login__main">
				<form @submit.prevent="">
					<h2 class="fs-2-5 mb-2">Login</h2>
					<label class="mb-1 block">
						<p class="mb-0-75 fs-1-125 fw-500">Username</p>
						<BaseInput
							v-model="form.username"
							name="username"
							placeholder="Username"
							required
						/>
					</label>
					<label class="mb-1 block">
						<p class="mb-0-75 fs-1-125 fw-500">Password</p>
						<BasePasswordInput
							name="password"
							v-model="form.password"
							placeholder="Password"
							required
						/>
					</label>
					<!-- <p
					class="text-danger mb-1"
					v-if="loginRequestResult.response.value?.message"
				>
					{{ loginRequestResult.response.value?.message }}
				</p> -->
					<p class="text-danger mb-1" v-if="error">
						Wrong username or password
					</p>

					<BaseButton
						class="mb-2 w-full"
						type="primary"
						:large="true"
						@click="login"
					>
						Login
					</BaseButton>
				</form>
				<SeparatorLine class="mb-2">Or</SeparatorLine>
				<BaseButton class="mb-0-75" to="/register" type="secondary">
					Create Account
				</BaseButton>
				<BaseButton class="w-full" type="as-link">
					Continue With Temporary Account
					<SvgIcon icon="arrow-right" />
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import BaseInput from '~/components/BaseInput.vue';
import BasePasswordInput from '~/components/BasePasswordInput.vue';
import SeparatorLine from '~/components/SeparatorLine.vue';
import type { ModelTypes } from '~/graphql/zeus';

const form = reactive<ModelTypes['LoginUserInput']>({
	username: '',
	password: ''
});

const { login: loginUser } = useUserStore();

const error = ref<boolean | null>(null);

const login = async () => {
	const router = useRouter();
	const success = await loginUser(form);
	if (success) {
		router.push('/');
	} else {
		error.value = true;
	}
};
</script>

<style lang="scss" scoped>
.login {
	overflow: auto;
	height: 100vh;
	padding-bottom: env(safe-area-inset-bottom, 0);
	@supports (height: 100dvh) {
		height: 100dvh;
	}
	&__inner-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100%;
	}
	&__main {
		width: 100%;
		padding: 1.5rem;
		max-width: 23.4375rem;
	}
}
</style>
