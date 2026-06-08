import { ref, onMounted, onUnmounted } from 'vue';

export function useScreenHeight() {
    const screenHeight = ref();
    if (window) {
        screenHeight.value = window.innerHeight;
    }

    const updateHeight = () => {
        const height = window.visualViewport?.height || window.innerHeight;
        screenHeight.value = height;
    };

    onMounted(() => {
        updateHeight(); // Set the height on initial load
        window.visualViewport?.addEventListener("resize", updateHeight);
        window.addEventListener("resize", updateHeight); // Fallback for unsupported browsers
    });

    onUnmounted(() => {
        window.visualViewport?.removeEventListener("resize", updateHeight);
        window.removeEventListener("resize", updateHeight); // Fallback for unsupported
    });

    const screenHeightPx = computed(() => `${screenHeight.value}px`);

    return {
        screenHeight,
        screenHeightPx
    };
}