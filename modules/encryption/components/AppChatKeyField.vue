<template>
	<div class="app-key-field">
		<div class="app-key-field__head">
			<p class="app-key-field__title">Current Key</p>
			<GenerateRandomKeyButton
				@generated="
					$event => {
						newKey = $event;
						encryptionKeysStore.saveNewCurrentKey();
					}
				"
				v-if="isCurrentKeyEditing"
			/>
		</div>
		<div class="app-key-field__input-wrapper">
			<BasePasswordInput
				class="app-key-field__input"
				v-if="isCurrentKeyEditing"
				v-model="newKey"
			/>
			<BasePasswordInput
				v-else
				:model-value="currentKey"
				disabled
				class="app-key-field__input"
			/>
			<BaseButton
				type="secondary"
				v-if="!isCurrentKeyEditing"
				@click="isCurrentKeyEditing = true"
			>
				<SvgIcon icon="edit" class="icon" />
			</BaseButton>
		</div>
		<PasswordRequirements
			class="mt-1"
			v-if="isCurrentKeyEditing"
			:validity="keyIsValid"
		/>
		<div
			class="app-key-field__edit-controls mt-1"
			v-if="isCurrentKeyEditing"
		>
			<BaseButton
				class="w-full"
				@click="isCurrentKeyEditing = false"
				type="secondary"
			>
				Cancel
			</BaseButton>
			<BaseButton
				class="w-full"
				@click="encryptionKeysStore.saveNewCurrentKey"
				:disabled="!isNewKeyValid"
				:disabled-reason="
					!isNewKeyValid ? newKeyRequirement : undefined
				"
			>
				Save key
			</BaseButton>
		</div>
		<AppChatIncomingKeySharingTransactions class="mt-1" />
	</div>
</template>

<script setup lang="ts">
import BasePasswordInput from '~/components/BasePasswordInput.vue';
import { useEncryptionKeysStore } from '../store/useEncryptionKeysStore';
import GenerateRandomKeyButton from './GenerateRandomKeyButton.vue';
import PasswordRequirements from '~/components/PasswordRequirements.vue';
import AppChatIncomingKeySharingTransactions from './AppChatIncomingKeySharingTransactions.vue';

const encryptionKeysStore = useEncryptionKeysStore();
const {
	isCurrentKeyEditing,
	currentKey,
	newKey,
	isNewKeyValid,
	newKeyRequirement
} = toRefs(encryptionKeysStore);

const keyIsValid = computed(() => validatePassword(newKey.value));
</script>

<style scoped lang="scss">
.app-key-field {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	&__head {
		display: flex;
		align-items: end;
		justify-content: space-between;
	}

	&__title {
		font-weight: 500;
		font-size: 1.125rem;
		line-height: 150%;
	}
	&__requirement {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.5);
	}
	&__input {
		flex: 1;
	}
	&__input-wrapper {
		display: flex;
		gap: 0.5rem;
	}

	&__edit-controls {
		display: flex;
		gap: 0.25rem;
	}
}
</style>
