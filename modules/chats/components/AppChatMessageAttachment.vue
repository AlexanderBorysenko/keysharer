<template>
	<div
		class="attachment"
		:class="{ _image: fileType === 'image' && fileUrl }"
	>
		<div
			class="attachment-image-view"
			v-if="fileUrl && fileType === 'image'"
		>
			<img
				:src="fileUrl"
				alt="Attachment"
				class="attachment-image-view__image"
			/>
			<button
				@click="downloadFile"
				class="attachment-image-view__download"
			>
				<img
					class="attachment-image-view__download-icon"
					src="/assets/images/attachment-file-download-icon.svg"
				/>
				<span class="attachment-image-view__download-size">
					{{ formatFileSize(file.file_size) }}
				</span>
			</button>
		</div>
		<div class="attachment-file-body" v-else>
			<div class="attachment-file-body__icon" v-if="!fileUrl">
				<img
					src="/assets/images/attachment-file-icon.svg"
					v-if="!decryptionInProgress"
				/>
				<RefreshingSpinner v-else />
			</div>
			<button
				class="attachment-file-body__icon"
				v-else
				@click="downloadFile"
			>
				<img src="/assets/images/attachment-file-download-icon.svg" />
			</button>
			<div class="attachment-file-body__main">
				<div class="attachment-file-body__title">
					<div class="attachment-file-body__ext">
						{{ file.original_file_name || file.file_name }}
					</div>
					<div
						class="attachment-file-body__decryption-error"
						v-if="decryptionError && !decryptionInProgress"
					>
						<SvgIcon
							icon="warning"
							class="attachment-file-body__decryption-error-icon"
						/>
						Decryption failed
					</div>
				</div>
				<p class="attachment-file-body__sub-title">
					<span v-if="!fileUrl">File is encrypted. </span
					>{{ formatFileSize(file.file_size) }}
				</p>
			</div>
			<BaseButton
				v-if="!fileUrl"
				type="primary"
				@click="decryptFile"
				class="attachment-file-body__decrypt-button"
			>
				Decrypt
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue';
import RefreshingSpinner from '~/components/RefreshingSpinner.vue';
import SvgIcon from '~/components/SvgIcon.vue';
import type { ModelTypes } from '~/graphql/zeus';
import chatEncryptionService from '~/modules/encryption/service/chatEncryptionService';
import { useEncryptionKeysStore } from '~/modules/encryption/store/useEncryptionKeysStore';
const keyStore = useEncryptionKeysStore();

const props = defineProps<{
	file: ModelTypes['MessageFile'];
	disableEncryption: boolean;
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

const { downloadFile } = useDownload(
	props.file.file_url || '',
	props.file.original_file_name || props.file.file_name || ''
);
</script>

<style scoped lang="scss">
@use '/styles/vars.scss' as *;
.attachment {
	display: flex;
	align-items: center;
	padding: 0.25rem 0.25rem 0 0.25rem;
	&__image-container {
		width: 100%;
		max-width: 18.75rem;
	}
	&__image {
		width: 100%;
	}
	&._image {
		padding: 0;
	}
}

.attachment-file-body {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: rgba($color: #000, $alpha: 0.2);
	padding: 0.25rem 0.5rem 0.25rem 0.25rem;
	border-radius: 0.5rem;
	width: 100%;
	@media (max-width: $mobile-width) {
		flex-wrap: wrap;
	}
	&__icon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 3.5rem;
		height: 3.5rem;
		background: rgba(255, 255, 255, 0.04);
		border: 0.0625rem solid rgba(255, 255, 255, 0.08);
		border-radius: 0.5rem;
		img {
			width: 2.5rem;
			height: 2.5rem;
			transition: transform 0.2s;
		}
		&:hover {
			img {
				transform: scale(1.1);
			}
		}
	}
	&__main {
		margin-right: auto;
	}
	&__title {
		font-weight: 400;
		font-size: 1.125rem;
		line-height: 150%;
		display: flex;
		gap: 0.5rem;
		align-items: flex-end;
		margin-bottom: 0.125rem;
	}
	&__sub-title {
		font-size: 0.875rem;
		line-height: 140%;
		letter-spacing: -0.01em;
		color: rgba(255, 255, 255, 0.7);
	}
	&__decrypt-button {
		margin-left: 2rem;
		@media (max-width: $mobile-width) {
			margin: 0;
			width: 100%;
		}
	}
	&__decryption-error {
		color: var(--danger);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		line-height: 140%;
		&-icon {
			width: 1rem;
			height: 1rem;
		}
	}
}
.attachment-image-view {
	position: relative;
	width: 100%;
	aspect-ratio: 1/1;
	min-width: 20rem;
	&__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
	}
	&__download {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
		line-height: 140%;
		letter-spacing: -0.01em;
		background: rgba(0, 0, 0, 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		position: absolute;
		bottom: 0.5rem;
		backdrop-filter: blur(10px);
		right: 0.5rem;
		&-icon {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
}
</style>
