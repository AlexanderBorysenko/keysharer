import type { TServerActionResponse } from "~/modules/user/types/TServerActionResponse";

export const useServerActionResponse = <T>(
    executor: () => Promise<TServerActionResponse<T>>
) => {
    const response = ref<TServerActionResponse<T> | null>(null);
    const loading = ref(false);

    const execute = async () => {
        if (loading.value) return;
        loading.value = true;
        response.value = await executor();
        loading.value = false;
    }

    const getFieldError = (field: string) => {
        if (!response.value) return null;
        if (!response.value.details) {
            if (response.value.error) return response.value.error;
            return null;
        }
        if (!response.value.details[field]) return null;

        return response.value.details[field];
    }

    const isErrorField = (field: string) => {
        return getFieldError(field) !== null;
    }

    const clear = () => {
        response.value = null;
    }

    return {
        response,
        execute,
        loading,
        getFieldError,
        isErrorField,
        clear,
    }
}