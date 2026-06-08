import {
    isPermissionGranted, requestPermission, sendNotification,
} from '@tauri-apps/plugin-notification';

export default defineNuxtPlugin((nuxtApp) => {
    const { $isTauri } = useNuxtApp();
    async function initNotificationsPermission() {
        if ($isTauri) {
            // Логіка для Tauri
            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === 'granted';
            }
            return permissionGranted;
        } else {
            // Логіка для браузера
            if (!('Notification' in window)) {
                console.error('Цей браузер не підтримує сповіщення.');
                return false;
            }
            if (Notification.permission === 'granted') {
                return true;
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } else {
                console.warn('Дозвіл на сповіщення відхилено раніше.');
                return false;
            }
        }
    }

    async function notify({
        title,
        body,
        id,
    }: {
        title: string,
        body: string,
        id?: number,
    }) {
        if ($isTauri) {
            // Логіка для Tauri
            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === 'granted';
            }
            if (permissionGranted) {
                sendNotification({
                    title, body, id
                });
            } else {
                console.warn('Permission for notifications not granted');
            }
        } else {
            // Логіка для браузера
            if (!('Notification' in window)) {
                console.error('Цей браузер не підтримує сповіщення.');
                return;
            }
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                }
                );
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification(title, {
                        body,
                        icon: '/images/icon.png',
                        badge: '/images/icon.png',
                    });
                } else {
                    console.warn('Дозвіл на сповіщення не надано.');
                }
            } else {
                console.warn('Дозвіл на сповіщення відхилено раніше.');
            }
        }
    }

    return {
        provide: {
            notify,
            initNotificationsPermission
        },
    };
});