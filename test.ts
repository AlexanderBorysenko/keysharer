const server = Bun.serve({
    port: 8080, // Specify the port number

    fetch(req, server) {
        // Attempt to upgrade the incoming request to a WebSocket connection
        if (server.upgrade(req)) {
            return; // If successful, no further response is needed
        }
        // If the upgrade fails, respond with an error message
        return new Response("Upgrade failed :(", { status: 500 });
    },

    websocket: {
        // Handler for when a new WebSocket connection is established
        open(ws) {
            console.log("WebSocket connection opened");
        },

        // Handler for incoming messages from clients
        message(ws, message) {
            console.log(`Received message: ${message}`);
            // Echo the received message back to the client
            ws.send(`Server received: ${message}`);
        },

        // Handler for when a WebSocket connection is closed
        close(ws, code, reason) {
            console.log(`WebSocket connection closed: ${code} - ${reason}`);
        },

        // Handler for managing backpressure; called when the write buffer drains
        drain(ws) {
            console.log("WebSocket backpressure relieved");
        },
    },
});

console.log(`Server is listening on ws://${server.hostname}:${server.port}`);
