<template>
	<div class="user-update-form__main">
		<label class="mb-1 block">
			<span class="fs-1-125 mb-0-5 block">Displayed Name</span>
			<BaseInput
				v-model="userForm.displayName"
				label="Displayed Name"
				placeholder="Enter displayed name"
				:error="!!errors.displayName"
			/>
			<p class="text-danger mt-0-5" v-if="!!errors.displayName">
				{{ errors.displayName }}
			</p>
		</label>
		<label class="mb-2 block">
			<span class="fs-1-125 mb-0-5 block"> Avatar Image </span>
			<BaseImageInput
				v-model="userForm.avatar"
				:previous-image-url="userStore.state.avatar || ''"
				class="mb-1"
			/>
			<p class="text-danger mb-0-5" v-if="!!errors.avatar">
				{{ errors.avatar }}
			</p>
		</label>
	</div>
	<div class="user-update-form__controls">
		<BaseButton
			type="primary"
			:large="true"
			@click="updateUser"
			class="user-update-form__button"
			:disabled="loading"
		>
			Save
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import BaseImageInput from '~/components/BaseImageInput.vue';
import { getResponseUserInputErrors } from '~/graphql/utils/getResponseUserInputError';
import { handleUnauthenticatedError } from '~/graphql/utils/handleUnauthenticatedError';
import type { ModelTypes } from '~/graphql/zeus';

const userStore = useUserStore();
const appNotifications = useAppNotificationsStore();
const { $postGQFormDataRequest } = useNuxtApp();

const userForm = reactive<ModelTypes['UpdateUserInput']>({
	avatar: null,
	displayName: userStore.state.displayName
});

const loading = ref(false);
const errors = ref<{ [key: string]: string }>({});
const updateUser = async () => {
	loading.value = true;
	try {
		await $postGQFormDataRequest(
			`
                mutation updateUser($input: UpdateUserInput!) {
                    updateUser(input: $input)
                }
            `,
			{ input: userForm }
		);

		appNotifications.addNotification({
			message: 'Your account settings updated successfully',
			type: 'success',
			icon: 'success'
		});
		errors.value = {};
	} catch (error: any) {
		handleUnauthenticatedError(error);
		errors.value = getResponseUserInputErrors(error);
	} finally {
		loading.value = false;
	}
};
</script>

<style scoped lang="scss">
.user-update-form {
	&__title {
		font-weight: 500;
		font-size: 1.125rem;
		line-height: 150%;
		margin-bottom: 0.25rem;
	}
	&__controls {
		display: flex;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: var(--ui-light-border);
		& > * {
			flex: 1;
		}
	}
}
</style>
