<template>
	<div class="register">
		<div class="register__inner-wrapper">
			<div class="register__main">
				<form @submit.prevent="">
					<h2 class="fs-2-5 mb-2">Register</h2>
					<label class="mb-1 block">
						<p class="mb-0-75 fs-1-125 fw-500">Email</p>
						<BaseInput
							v-model="form.email"
							name="email"
							placeholder="Email"
							type="email"
							:error="!!errors.email"
							required
							@input="errors.email = ''"
						/>
						<p class="text-danger mt-0-5" v-if="!!errors.email">
							{{ errors.email }}
						</p>
					</label>

					<label class="mb-1 block">
						<p class="mb-0-75 fs-1-125 fw-500">Username</p>
						<BaseInput
							v-model="form.username"
							name="username"
							placeholder="Username"
							:error="!!errors.username"
							@input="errors.username = ''"
							required
						/>
						<p class="text-danger mt-0-5" v-if="!!errors.username">
							{{ errors.username }}
						</p>
					</label>
					<label class="mb-1 block">
						<p class="mb-0-75 fs-1-125 fw-500">Password</p>
						<BasePasswordInput
							name="password"
							v-model="form.password"
							placeholder="Password"
							required
							:error="!!errors.password"
							class="mb-0-5"
							@input="errors.password = ''"
						/>
						<PasswordRequirements :validity="passwordValidity" />
					</label>
					<label class="mb-1 block">
						<p class="mb-0-75 fs-1-125 fw-500">Confirm Password</p>
						<BasePasswordInput
							name="confirm_password"
							v-model="form.confirm_password"
							placeholder="Confirm Password"
							:error="!!errors.confirm_password"
							required
						/>
						<p
							class="text-danger mb-2"
							v-if="!!errors.confirm_password"
						>
							{{ errors.confirm_password }}
						</p>
					</label>
					<p class="text-danger mb-1" v-if="errors.server">
						{{ errors.server }}
					</p>
					<BaseButton
						class="mb-2 w-full"
						type="primary"
						:large="true"
						:disable="loading"
						@click="register"
					>
						Register
					</BaseButton>
				</form>
				<SeparatorLine class="mb-2">Or</SeparatorLine>
				<BaseButton class="mb-0-75" to="/login" type="secondary">
					Login
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
import BaseInput from '~/components/BaseInput.vue';
import BasePasswordInput from '~/components/BasePasswordInput.vue';
import PasswordRequirements from '~/components/PasswordRequirements.vue';
import { getResponseUserInputErrors } from '~/graphql/utils/getResponseUserInputError';
import type { ModelTypes } from '~/graphql/zeus';
const router = useRouter();

const { registerRequest } = useUserStore();

const form = reactive<ModelTypes['CreateUserInput']>({
	email: '',
	username: '',
	password: '',
	confirm_password: ''
});
const passwordValidity = computed(() => validatePassword(form.password));
watch(
	() => form.username,
	() => {
		form.username = form.username.replace(/\s/g, '_');
	}
);

const errors = ref<{ [key: string]: string }>({});
const loading = ref(false);

const register = async () => {
	loading.value = true;
	try {
		const response = await registerRequest(form);
	} catch (error: any) {
		errors.value = getResponseUserInputErrors(error.response);
		return;
	} finally {
		loading.value = false;
	}

	router.push('/thank-you-for-registration');
};
</script>

<style scoped lang="scss">
.register {
	height: 100vh;
	overflow: auto;
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
