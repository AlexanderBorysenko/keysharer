import { ref } from 'vue';

export function useSystemNotifications() {
    const permissionGranted = ref(false);

    // Запит дозволу на сповіщення
    const requestPermission = async () => {
        if (typeof window === 'undefined') {
            return;
        }

        if (!('Notification' in window)) {
            console.warn('Notifications are not supported.');
            return;
        }

        const permission = await Notification.requestPermission();
        permissionGranted.value = permission === 'granted';

        if (!permissionGranted.value) {
            console.warn('Notifications are disabled.');
        }
    };

    // Функція для виводу сповіщень
    const showNotification = (title: string, options: {
        body?: string;
        icon?: string;
    } = {}) => {
        if (typeof window === 'undefined') {
            return;
        }
        if (!('Notification' in window) || !permissionGranted.value) {
            console.warn('Notifications are disabled.');
            return;
        }

        new Notification(title, {
            body: options.body || '',
            icon: options.icon || '/images/keysharer-logo.svg',
            ...options,
        });
    };

    return {
        permissionGranted,
        requestPermission,
        showNotification,
    };
}
