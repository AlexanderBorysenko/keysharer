<template>
	<div class="password-requirements">
		<div
			class="password-requirements__item"
			v-for="requirement in validity.requirements"
			:key="requirement.requirement"
			:class="{ _fulfilled: requirement.fulfilled }"
		>
			<SvgIcon
				:icon="requirement.fulfilled ? 'valid' : 'invalid'"
				class="password-requirements__icon"
			/>
			{{ requirement.requirement }}
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TPasswordValidation } from '~/utils/validatePassword';
import SvgIcon from './SvgIcon.vue';

defineProps<{
	validity: TPasswordValidation;
}>();
</script>

<style scoped lang="scss">
.password-requirements {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
	color: rgba($color: #fff, $alpha: 0.7);
	font-size: 0.875rem;
	line-height: 100%;
	&__item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		&._fulfilled {
			color: rgba($color: #fff, $alpha: 0.4);
		}
	}

	&__icon {
		width: 0.875rem;
		height: 0.875rem;
	}
}
</style>
