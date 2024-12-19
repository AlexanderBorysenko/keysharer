<template>
	<div class="attachments-preview" v-if="files.length > 0">
		<div v-for="file in files" :key="file.name" class="attachment">
			<div class="attachment__preview">
				<img
					v-if="file.type.startsWith('image/')"
					:src="createObjectURL(file)"
					alt="attachment preview"
					class="attachment__image"
				/>
				<SvgIcon v-else icon="file" class="attachment__icon" />
			</div>
			<div class="attachment__meta">
				<div class="attachment__file-name">
					{{ file.name }}
				</div>
				<div class="attachment__file-size">
					{{ formatFileSize(file.size) }}
				</div>
			</div>
			<button @click="removeFile(file)" class="attachment__remove">
				<SvgIcon icon="cross" class="icon" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import SvgIcon from '~/components/SvgIcon.vue';
import { useMessageFormStore } from '../store/useMessageFormStore';

const messageFormStore = useMessageFormStore();
const { files } = storeToRefs(messageFormStore);

const removeFile = (file: File) => {
	const newFiles = files.value.filter(f => f !== file);
	files.value = newFiles;
};

const createObjectURL = (file: File) => URL.createObjectURL(file);
</script>

<style scoped lang="scss">
.attachments-preview {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border-radius: 0.625rem;
	padding: 0.5rem;
	max-width: 20rem;
	width: 100%;
	max-height: 50vh;
	overflow-y: auto;
}
.attachment {
	width: 100%;
	display: flex;
	align-items: center;
	padding: 0.25rem;
	gap: 0.5rem;
	&__remove {
		padding: 0.5rem;
		width: 2rem;
		height: 2rem;
		flex: 0 0 2rem;
		margin-left: auto;
		transition: background 0.2s, color 0.2s;
		border-radius: 0.625rem;
		&:hover {
			background: rgba(255, 255, 255, 0.1);
			color: #fff;
		}
	}
	&__meta {
		color: rgba(255, 255, 255, 0.8);
	}
	&__file-name {
		font-size: 0.875rem;
		margin-bottom: 0.1rem;
		word-break: break-all;
	}
	&__file-size {
		font-size: 0.65rem;
	}
	&__preview {
		width: 3rem;
		height: 3rem;
		flex: 0 0 3rem;
		overflow: hidden;
		border-radius: 0.625rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	&__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	&__icon {
		width: 70%;
		height: 70%;
	}
}
</style>
