<template>
	<label class="base-clearable-input-field">
		<input
			type="search"
			v-model="model"
			class="base-clearable-input-field__input"
			:placeholder="placeholder"
		/>
		<span
			class="base-clearable-input-field__clear-button"
			@click="model = ''"
		>
			<SvgIcon
				icon="cross"
				class="base-clearable-input-field__clear-icon"
			/>
		</span>
	</label>
</template>

<script setup lang="ts">
defineProps<{
	placeholder?: string;
}>();
const model = defineModel<string>({
	required: true
});
</script>

<style scoped lang="scss">
.base-clearable-input-field {
	display: flex;
	align-items: center;
	padding: 0.875rem 1rem;
	gap: 0.5rem;
	background: rgba(255, 255, 255, 0.1);
	border: 0.0625rem solid rgba(255, 255, 255, 0.5);
	border-radius: 0.75rem;
	&__input {
		flex: 1;
		font-weight: 400;
		font-size: 1rem;
		line-height: 150%;
		background: none;
		color: inherit;
		outline: none;
	}
	&__clear-button {
		cursor: pointer;
		color: rgba(255, 255, 255, 0.5);
		transition: color 0.2s;
		&:hover {
			color: rgba(255, 255, 255, 1);
		}
	}
	&__clear-icon {
		width: 1.125rem;
		height: 1.125rem;
	}
}
</style>
