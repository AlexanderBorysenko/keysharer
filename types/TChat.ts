import type { TMessage } from "../modules/chats/types/TMessage";
import type { TUser } from "../modules/user/types/TUser";

export type TChat = {
    id: number;
    messages: TMessage[];
    users: TUser[];
}