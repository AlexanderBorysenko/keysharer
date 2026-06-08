type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
    icon?: string;
}

export const useAppNotificationsStore = defineStore('appNotificationsStore', () => {
    const notifications = ref<Notification[]>([]);
    let nextId = 1;

    const addNotification = ({ type, message, icon }: { type: NotificationType; message: string; icon?: string }) => {
        const id = nextId++;
        notifications.value.push({ id, type, message, icon });

        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id: number) => {
        notifications.value = notifications.value.filter(notification => notification.id !== id);
    };

    return {
        notifications,
        addNotification,
        removeNotification,
    };
});