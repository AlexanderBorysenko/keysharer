<template>
	<time class="message-time">
		{{ time }}
	</time>
</template>

<script setup lang="ts">
const props = defineProps<{
	time: string;
}>();

const currentDay = new Date().getDate();
const time = computed(() => {
	const date = new Date(+props.time);
	const day = date.getDate();
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
	const month = monthNames[date.getMonth()];
	return `${day === currentDay ? '' : `${day} ${month} `}${hours}:${minutes}`;
});
</script>

<style scoped lang="scss">
.message-time {
	font-size: 0.875rem;
	line-height: 140%;
	color: rgba(255, 255, 255, 0.7);
	@media (max-width: 640px) {
		font-size: 0.75rem;
	}
}
</style>
