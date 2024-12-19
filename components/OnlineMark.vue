<template>
	<div
		class="online-mark"
		:class="{ _online: onlineUsersCount, _offline: !onlineUsersCount }"
	>
		{{ onlineStatus }}
	</div>
</template>

<script setup lang="ts">
import type { ModelTypes } from '~/graphql/zeus';
import { useOnlineStatusesStore } from '~/modules/user/store/onlineStatusesStore';
const { countUsersSelectionOnline } = useOnlineStatusesStore();
const userStore = useUserStore();

const props = defineProps<{
	online?: boolean;
	count?: number;
	users: ModelTypes['User'][];
}>();

const onlineUsersCount = computed(() =>
	countUsersSelectionOnline(
		props.users.map(user => user.id).filter(id => id !== userStore.state.id)
	)
);
const onlineStatus = computed(() => {
	if (props.users.length <= 2) {
		return onlineUsersCount.value ? 'Online' : 'Offline';
	} else {
		return onlineUsersCount.value
			? `${onlineUsersCount.value} online`
			: 'Offline';
	}
});
</script>

<style scoped lang="scss">
.online-mark {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 0.75em;
	line-height: 0.75em;
	text-align: center;
	&._online {
		color: var(--success);
	}
	&._offline {
		color: rgba(255, 255, 255, 0.7);
	}
}
</style>
