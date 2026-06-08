export const useAppSidebarStore = defineStore('appSidebarStore', () => {
    const isOpened = ref(false);

    const open = () => {
        isOpened.value = true;
    }

    const close = () => {
        isOpened.value = false;
    }

    return {
        isOpened,
        open,
        close,
    }
});