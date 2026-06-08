export type TMessageStatus = 'sending' | 'sent' | 'read';
export type TMessageType = 'text' | 'image' | 'video' | 'audio';

export type TMessage = {
    id: number;
    content: string;
    type: TMessageType;
    senderId: number;
    chatId: number;
    createdAt: Date;
}