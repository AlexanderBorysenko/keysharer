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
					v-for="user in result"
					@click="() => selectItem(user.id)"
					:key="user.id"
					:user="user"
					:showUserOnlineStatus="false"
					:selected="user.id === model"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseClearableInputField from '~/components/BaseClearableInputField.vue';
import useUserSearch from '../composables/useUserSearch';
import UserSelectFieldSearchResultItem from './UserSelectFieldSearchResultItem.vue';

const { search, result } = useUserSearch();

const model = defineModel<string | null>({
	required: true
});

const selectItem = (id: string) => {
	if (id === model.value) {
		model.value = null;
	} else {
		model.value = id;
	}
};

watch(result, () => {
	if (!result.value.find(user => user.id === model.value)) {
		model.value = null;
	}
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
