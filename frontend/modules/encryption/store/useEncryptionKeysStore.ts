import { useChatStore } from "~/modules/chats/store/useChatStore";

export const useEncryptionKeysStore = defineStore('encryptionKeysStore', () => {
    const chatStore = useChatStore();

    const keys = ref<{
        chatId: string;
        key: string;
    }[]>([]);

    const addKey = (chatId: string, key: string) => {
        keys.value.push({ chatId, key });
    }

    const getKey = (chatId: string) => {
        return keys.value.find(k => k.chatId === chatId)?.key;
    }

    const setKey = (chatId: string, key: string) => {
        const index = keys.value.findIndex(k => k.chatId === chatId);
        if (index !== -1) {
            keys.value[index].key = key;
        } else {
            addKey(chatId, key);
        }
        if (chatId === chatStore.chatState.id) {
            isCurrentKeyEditing.value = false;
            closeCurrentKeyManager();
        }
    }

    const useKey = (chatId: string) => {
        return computed(() => getKey(chatId));
    }

    const currentKey = ref('');
    watch(() => chatStore.chatState.id, () => {
        currentKey.value = getKey(chatStore.chatState.id ?? '') ?? '';
    });
    watch(keys.value, () => {
        currentKey.value = getKey(chatStore.chatState.id ?? '') ?? '';
    });

    const isCurrentKeyValid = computed(() => validatePassword(currentKey.value).valid);

    const forceEncryptionDisabled = ref(false);
    const toggleForceEncryptionDisabled = () => {
        forceEncryptionDisabled.value = !forceEncryptionDisabled.value;
    }

    const isEncryptionEnabled = computed(() => !forceEncryptionDisabled.value && isCurrentKeyValid.value);

    const isCurrentKeyManagerOpened = ref(false);
    const openCurrentKeyManager = () => {
        isCurrentKeyManagerOpened.value = true;
    }
    const closeCurrentKeyManager = () => {
        isCurrentKeyManagerOpened.value = false;
    }
    const newKey = ref('');
    const newKeyRequirement = ref('Key must be at least 8 characters long');
    const hasUnsavedChanges = computed(() => currentKey.value !== newKey.value);
    watch(currentKey, () => {
        newKey.value = currentKey.value;
    }, {
        immediate: true,
    });
    const isNewKeyValid = computed(() => validatePassword(newKey.value).valid);
    const saveNewCurrentKey = () => {
        if (!isCurrentKeyEditing.value) return;
        if (!isNewKeyValid.value) return;
        setKey(chatStore.chatState.id ?? '', newKey.value);
        isCurrentKeyEditing.value = false;
        closeCurrentKeyManager();
    }
    const isCurrentKeyEditing = ref(false);
    watchEffect(() => {
        if (!currentKey.value && chatStore.chatState.id) isCurrentKeyEditing.value = true;
        else isCurrentKeyEditing.value = false;
    });

    return {
        addKey,
        getKey,
        setKey,
        useKey,
        isCurrentKeyValid,
        forceEncryptionDisabled,
        toggleForceEncryptionDisabled,
        isEncryptionEnabled,
        isCurrentKeyManagerOpened,
        openCurrentKeyManager,
        closeCurrentKeyManager,
        currentKey,
        newKey,
        newKeyRequirement,
        isNewKeyValid,
        hasUnsavedChanges,
        saveNewCurrentKey,
        isCurrentKeyEditing,
    };
})