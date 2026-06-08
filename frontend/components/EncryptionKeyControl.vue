<template>
	<div class="">
		<div class="flex space-x-2">
			<input
				type="text"
				placeholder="Enter key"
				class="border rounded p-2 flex-1"
				v-model="key"
			/>
			<button class="bg-blue-500 text-white rounded p-2">
				Share Key
			</button>
		</div>
		<dialog ref="dialog" class="p-6 bg-white rounded shadow-lg">
			<h3 class="text-lg font-semibold">
				The user wants to share a conversation key with you
			</h3>
			<div class="flex space-x-2 mt-4">
				<button
					class="bg-green-500 text-white rounded p-2"
					@click="accept"
				>
					Accept
				</button>
				<button
					class="bg-red-500 text-white rounded p-2"
					@click="cancel"
				>
					Cancel
				</button>
			</div>
		</dialog>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	conversationId?: number;
}>();
const key = defineModel<string>();

const dialog = ref<HTMLDialogElement | null>(null);

const accept = () => {
	dialog.value?.close();
	// Handle accept logic here
};

const cancel = () => {
	dialog.value?.close();
	// Handle cancel logic here
};

const showDialog = () => {
	dialog.value?.showModal();
};

onMounted(() => {
	showDialog();
});
</script>

<style></style>
