import { ref, watch } from 'vue';
import { typedGql } from "~/graphql/zeus/typedDocumentNode";
import { type GenericOperation, type ModelTypes, type ValueTypes } from "~/graphql/zeus";

export const useSubscription = <
    R extends keyof ValueTypes = GenericOperation<"subscription">,
    SubscriptionKey extends keyof ValueTypes[R] = keyof ValueTypes[R],
>(
    subscription: { [P in SubscriptionKey]: ValueTypes[R][P] }
) => {
    const { $apollo } = useNuxtApp();

    const callbacks: Array<(payload: ValueTypes[R][SubscriptionKey]) => void> = [];
    const on = (callback: (payload: ModelTypes[R][SubscriptionKey]) => void) => {
        callbacks.push(callback);
    };
    const off = (callback: (payload: ModelTypes[R][SubscriptionKey]) => void) => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    };

    const stop = ref(false);
    const stopSubscription = () => {
        stop.value = true;
        callbacks.splice(0, callbacks.length);
    };

    watch(
        [() => $apollo.value],
        () => {
            if (!$apollo.value) return;
            const query = typedGql('subscription')(subscription as any);

            const subscriptionInstance = $apollo.value.subscribe(
                {
                    query,
                }
            );
            subscriptionInstance.subscribe({
                next: (payload) => {
                    if (stop.value) return;
                    const subscriptionKey = Object.keys(subscription)[0];
                    // @ts-ignore
                    callbacks.forEach((cb) => cb(payload.data[subscriptionKey]));
                },
            });
        },
        { immediate: true }
    );

    return {
        on,
        off,
        stopSubscription,
    };
};
