import { io, Socket } from 'socket.io-client';
import { ref } from 'vue';

const socketInstance = ref<Socket | null>(null);

export const useSocket = () => {
    const user = useUserStore();
    const token = user.getToken();

    if (!socketInstance.value) {
        socketInstance.value = io('http://localhost:3000', {
            transports: ['websocket'], // Use WebSocket for better performance
            autoConnect: true, // Automatically connect
            auth: {
                token: token,
            },
        });

        // Add optional listeners for debugging purposes
        socketInstance.value.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socketInstance.value.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });
    }

    return socketInstance.value;
};
