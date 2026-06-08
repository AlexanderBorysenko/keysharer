<template>
	<BaseContextModal
		:is-opened="chatUsersManagerStore.isChatUsersManagerModalOpen"
		class="chat-settings"
		@close="chatUsersManagerStore.closeChatUsersManagerModal"
	>
		<div class="chat-settings__inner">
			<div class="chat-settings__main">
				<img
					src="~/assets/images/chats-icon.svg"
					class="chat-settings__chats-icon"
					alt=""
				/>
				<div
					class="chat-settings__users"
					v-if="chatUsersManagerStore.managerStage === 'list-users'"
				>
					<AppChatUsersManagerUser
						v-for="user in users"
						:key="user.id"
						:user="user"
					/>
				</div>
				<div
					class=""
					v-if="chatUsersManagerStore.managerStage === 'add-user'"
				>
					<UserSelectField
						v-model="chatUsersManagerStore.userToAddId"
						:exclude="chatStore.chatState.users?.map(u => u.id)"
						:label="'Select User'"
					/>
				</div>
			</div>
			<div
				class="chat-settings__controls"
				v-if="chatStore.chatState.iAmAdmin"
			>
				<BaseButton
					v-if="chatUsersManagerStore.managerStage === 'list-users'"
					type="primary"
					:large="true"
					@click="chatUsersManagerStore.managerStage = 'add-user'"
					class="chat-settings__button"
				>
					Add New Member
				</BaseButton>
				<BaseButton
					v-if="chatUsersManagerStore.managerStage === 'add-user'"
					type="secondary"
					:large="true"
					@click="chatUsersManagerStore.managerStage = 'list-users'"
					class="chat-settings__button"
				>
					Back
				</BaseButton>
				<BaseButton
					v-if="chatUsersManagerStore.managerStage === 'add-user'"
					type="primary"
					:disabled="!chatUsersManagerStore.userToAddId"
					:large="true"
					@click="chatUsersManagerStore.addMember"
					class="chat-settings__button"
				>
					Add User
				</BaseButton>
			</div>
		</div>
	</BaseContextModal>
</template>

<script setup lang="ts">
import UserSelectField from '~/modules/user/components/UserSelectField.vue';
import { useChatStore } from '../store/useChatStore';
import { useChatUsersManagerStore } from '../store/useChatUsersManagerStore';
import AppChatUsersManagerUser from './AppChatUsersManagerUser.vue';
const userStore = useUserStore();
const chatStore = useChatStore();
const users = computed(() =>
	chatStore.chatState.users?.filter(u => u.id !== userStore.state.id)
);

const chatUsersManagerStore = useChatUsersManagerStore();
</script>

<style scoped lang="scss">
.chat-settings {
	&__main {
		padding: 1.5rem;
	}
	&__users {
		overflow: auto;
		max-height: 20rem;
	}
	&__chats-icon {
		width: 3rem;
		height: 3rem;
		display: block;
		margin-bottom: 1rem;
	}
	&__title {
		font-weight: 500;
		font-size: 1.125rem;
		line-height: 150%;
		margin-bottom: 0.25rem;
	}
	&__controls {
		display: flex;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: var(--ui-light-border);
		& > * {
			flex: 1;
		}
	}
}
</style>
