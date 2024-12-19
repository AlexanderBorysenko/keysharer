<template>
	<BaseFeatureButton
		label="Share Your Key"
		:disabled="hasUnsavedChanges || !currentKey"
		:disabled-message="disabledMessage"
		icon="share"
		@click="openKeySharingModal"
	>
		To simplify and secure your communication, you can share your key with
		other chat members. The key is sent using asymmetric encryption and can
		be decrypted only by the receiver. Works only with online users.
	</BaseFeatureButton>
</template>

<script setup lang="ts">
import BaseFeatureButton from '~/components/BaseFeatureButton.vue';
import { useEncryptionKeysStore } from '../store/useEncryptionKeysStore';
import { useKeySharingStore } from '../store/useKeySharingStore';

const { openKeySharingModal } = useKeySharingStore();

const encryptionKeyStore = useEncryptionKeysStore();
const { hasUnsavedChanges, currentKey } = storeToRefs(encryptionKeyStore);
const disabledMessage = computed(() => {
	if (hasUnsavedChanges.value) {
		return 'Please save your key first';
	}
	if (!currentKey.value) {
		return 'Please provide a key first';
	}
	return '';
});
</script>

<style scoped></style>
