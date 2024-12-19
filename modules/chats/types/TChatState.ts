import type { ModelTypes } from "~/graphql/zeus";

export type TChatState = {
    id: string | null;
    users: {
        id: string;
        username: string;
        displayName?: string | null;
        avatar?: string | null;
        isTyping?: boolean;
    }[];
    name: string;
    avatar: string;
    messages: ModelTypes['Message'][];
}