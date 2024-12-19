import { onMounted, onUnmounted, ref } from 'vue';

export function useElementOutsideClick(callback: (event: MouseEvent) => void) {
    const elementRef = ref<HTMLElement | null>();
    const isOutsideClick = ref(false);

    const handleClickOutside = (event: MouseEvent) => {
        if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
            isOutsideClick.value = true;
            callback(event);
        } else {
            isOutsideClick.value = false;
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
    });

    return {
        elementRef,
        isOutsideClick,
    };
}