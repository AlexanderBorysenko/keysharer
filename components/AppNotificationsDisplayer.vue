<template>
	<div class="notifications-container">
		<transition-group name="notification" tag="div">
			<div
				v-for="notification in notifications"
				:key="notification.id"
				:class="['notification', notification.type]"
			>
				<SvgIcon
					v-if="notification.icon"
					:icon="notification.icon"
					class="notification-icon"
				/>
				<span class="notification-message">{{
					notification.message
				}}</span>
			</div>
		</transition-group>
	</div>
</template>

<script setup lang="ts">
import { useAppNotificationsStore } from '~/stores/appNotificationsStore';
import SvgIcon from '~/components/SvgIcon.vue';

const { notifications } = storeToRefs(useAppNotificationsStore());
</script>

<style scoped lang="scss">
.notifications-container {
	position: fixed;
	top: 1rem;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	width: calc(100% - 2rem);
	max-width: 30rem;
	z-index: 1000;
}

.notification {
	display: flex;
	align-items: center;
	padding: 0.75rem 1rem;
	border-radius: 0.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	color: #fff;
	&.success {
		background-color: #4caf50;
	}
	&.error {
		background-color: #f44336;
	}
	&.info {
		background-color: #2196f3;
	}
}

.notification-icon {
	margin-right: 0.5rem;
	width: 1.5rem;
	height: 1.5rem;
}

.notification-message {
	flex: 1;
}

.notification-enter-active,
.notification-leave-active {
	transition: opacity 0.5s, transform 0.5s;
}

.notification-enter-from,
.notification-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}
</style>
