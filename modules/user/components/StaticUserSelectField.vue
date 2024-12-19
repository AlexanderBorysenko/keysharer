<template>
	<div class="user-select-field">
		<BaseClearableInputField
			placeholder="Search by username"
			class="user-select-field__search"
			v-model="search"
		/>
		<div class="user-select-field__search-results-container">
			<div class="user-select-field__search-results">
				<UserSelectFieldSearchResultItem
					v-for="user in filteredUsers"
					@click="selectItem(user.id)"
					@offline="deselectItem(user.id)"
					:key="user.id"
					:user="user"
					:selected="model.includes(user.id)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseClearableInputField from '~/components/BaseClearableInputField.vue';
import UserSelectFieldSearchResultItem from './UserSelectFieldSearchResultItem.vue';
import { ref, computed, watch, defineProps, defineModel } from 'vue';
import type { ModelTypes } from '~/graphql/zeus';

const props = defineProps<{ users: ModelTypes['User'][] }>();

const search = ref('');

const model = defineModel<string[]>({
	required: true,
	default: () => []
});

const filteredUsers = computed(() => {
	return search.value
		? props.users.filter(
				user =>
					user.username
						?.toLowerCase()
						.includes(search.value.toLowerCase()) ||
					user.displayName
						?.toLowerCase()
						.includes(search.value.toLowerCase())
		  )
		: props.users;
});

const selectItem = (id: string) => {
	if (model.value.includes(id)) {
		model.value = model.value.filter(userId => userId !== id);
	} else {
		model.value.push(id);
	}
};
const deselectItem = (id: string) => {
	model.value = model.value.filter(userId => userId !== id);
};

watch(filteredUsers, () => {
	model.value = model.value.filter(id =>
		filteredUsers.value.some(user => user.id === id)
	);
});
</script>

<style scoped lang="scss">
.user-select-field {
	height: 100%;
	&__search {
		margin-bottom: 1rem;
	}
	&__search-results-container {
		overflow: auto;
		height: min(14rem, calc(100vh - 26rem));
	}
	&__search-results {
		display: grid;
		gap: 0.125rem;
	}
}
</style>
