<template>
	<div class="emoji-grid">
		<span
			v-for="emoji in emojis"
			:key="emoji"
			class="emoji-item"
			@click="() => selectEmoji(emoji)"
		>
			{{ emoji }}
		</span>
	</div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

// prettier-ignore
const emojis = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
    '😋', '😎', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩',
    '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
    '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
    '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖',
    '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯',
    '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠',
    '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺',
    '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹',
    '👺', '💀', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹',
    '😻', '😼', '😽', '🙀', '😿', '😾'
  ];

const emit = defineEmits(['select']);

function selectEmoji(emoji: string) {
	emit('select', emoji);
}
</script>

<style scoped>
.emoji-grid {
	padding: 1rem;
	border-radius: 0.75rem;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(0.625rem);

	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
	gap: 0.625rem;
	padding: 0.625rem;
}

.emoji-item {
	font-size: 1.5rem;
	cursor: pointer;
	text-align: center;
	line-height: 2.5rem;
	border-radius: 0.3125rem;
	transition: background-color 0.2s;
}

.emoji-item:hover {
	background-color: rgba(255, 255, 255, 0.1);
}
</style>
