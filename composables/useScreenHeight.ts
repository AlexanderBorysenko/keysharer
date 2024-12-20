import { ref, onMounted, onUnmounted } from 'vue';

export function useScreenHeight() {
    const screenHeight = ref();
    if (window) {
        screenHeight.value = window.innerHeight;
    }

    const updateHeight = () => {
        screenHeight.value = window.innerHeight;
    };

    onMounted(() => {
        window.addEventListener('resize', updateHeight);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateHeight);
    });

    const screenHeightPx = computed(() => `${screenHeight.value}px`);

    return {
        screenHeight,
        screenHeightPx
    };
}