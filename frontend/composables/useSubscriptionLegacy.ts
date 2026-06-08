import { type GenericOperation, type ModelTypes, type ScalarDefinition, type ValueTypes } from "~/graphql/zeus";

// export const useSubscription = <
//     R extends keyof ValueTypes = GenericOperation<"subscription">,
//     SubscriptionKey extends keyof ValueTypes[R] = keyof ValueTypes[R],
// >(
//     subscription: { [P in SubscriptionKey]: ValueTypes[R][P] }
// ) => {
//     const { $wsClient } = useNuxtApp();

//     const callbacks: Array<(payload:
//         ValueTypes[R][SubscriptionKey]
//     ) => void> = [];
//     const on = (callback: (payload: ModelTypes[R][SubscriptionKey]) => void) => {
//         callbacks.push(callback);
//     };
//     const off = (callback: (payload: ModelTypes[R][SubscriptionKey]) => void) => {
//         const index = callbacks.indexOf(callback);
//         if (index !== -1) {
//             callbacks.splice(index, 1);
//         }
//     };

//     const stop = ref(false);
//     const stopSubscription = () => {
//         stop.value = true;
//         callbacks.splice(0, callbacks.length);
//     }

//     watch(
//         () => $wsClient.value,
//         () => {
//             if (stop.value) return;
//             if (!$wsClient.value) return;
//             const subscriptionInstance = $wsClient.value("subscription")(
//                 subscription
//             );
//             // @ts-ignore
//             subscriptionInstance.on((payload) => {
//                 // payload is an object with a single key
//                 const subscriptionKey = Object.keys(subscription)[0];
//                 // @ts-ignore
//                 callbacks.forEach((cb) => cb(payload[subscriptionKey]));
//             });
//         }, { immediate: true }
//     );

//     return {
//         on,
//         off,
//         stopSubscription
//     };
// };