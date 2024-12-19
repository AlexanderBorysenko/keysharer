<template>
	<div class="attachment">
		<div class="" v-if="fileUrl">
			<div
				class="attachment__image-container"
				v-if="file.file_type.startsWith('image')"
			>
				<img
					:src="fileUrl"
					alt="Wrong Encryption Key"
					class="attachment__image"
				/>
			</div>
			<div v-else>
				<a :href="fileUrl" target="_blank">{{ file.file_name }}</a>
			</div>
		</div>
		<div>Type: {{ file.file_type }}</div>
		<div class="">Size: {{ formatFileSize(file.file_size) }}</div>
		<BaseButton type="primary" @click="decryptFile"> Decrypt </BaseButton>
		{{ decryptionInProgress ? 'Decrypting...' : '' }}
		{{ decryptionError }}
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import type { ModelTypes } from '~/graphql/zeus';
import chatEncryptionService from '~/modules/encryption/service/chatEncryptionService';
import { useEncryptionKeysStore } from '~/modules/encryption/store/useEncryptionKeysStore';
const keyStore = useEncryptionKeysStore();

const props = defineProps<{
	file: ModelTypes['MessageFile'];
	disableEncryption: boolean | null | undefined;
}>();

const fileType: 'image' | 'video' | 'file' = (() => {
	if (props.file.file_type.startsWith('image')) return 'image';
	if (props.file.file_type.startsWith('video')) return 'video';
	return 'file';
})();

const decryptionInProgress = ref(false);
const decryptionError = ref<string | null>(null);
const fileUrl = ref<string | null>(null);
if (props.disableEncryption) {
	fileUrl.value = props.file.file_url || null;
}

const decryptFile = async () => {
	if (!props.file.file_url || props.disableEncryption) return;
	try {
		decryptionInProgress.value = true;
		fileUrl.value = await chatEncryptionService.getDecryptedObjectURL(
			props.file.file_url,
			props.file.file_type
		);
		decryptionError.value = null;
	} catch (e: any) {
		decryptionError.value = e.message;
	} finally {
		decryptionInProgress.value = false;
	}
};

watch(
	() => keyStore.currentKey,
	() => {
		if (
			(fileType === 'image' || fileType === 'video') &&
			props.file.file_size < 5 * 1024 * 1024
		) {
			decryptFile();
		}
	},
	{ immediate: true }
);
</script>

<style scoped lang="scss">
.attachment {
	display: flex;
	align-items: center;
	background: rgba($color: #000, $alpha: 0.2);
	padding: 0.5rem;
	border-radius: 0.5rem;
	&__image-container {
		width: 100%;
		max-width: 300px;
	}
	&__image {
		width: 100%;
	}
}
</style>
