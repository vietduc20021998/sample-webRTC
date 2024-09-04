// Importing the required modules
const WebSocketServer = require('ws');
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })

const arrUserInfo = [];

// Creating connection using websocket
wss.on("connection", ws => {
    let userInfo;
    //on message from client
    ws.on("message", data => {
        try {
            const user = JSON.parse(data);
            userInfo = user;
            const isExist = arrUserInfo.some(info => info.name === user.name);
            if (isExist) {
                return ws.send(JSON.stringify({
                    message: "duplicated",
                    currentUser: undefined,
                    data: []
                }));
            }
            arrUserInfo.push(user);
            const newData = JSON.stringify({
                message: 'success',
                currentUser: user,
                data: arrUserInfo,
            });

            // Send the message to all clients
            if (!isExist) {
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocketServer.OPEN) {
                        client.send(newData);
                    };
                });
            };
        } catch (error) {
            console.log(error);
        }
    });
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        const findIndex = arrUserInfo.findIndex(i => i.userId === userInfo.userId);
        arrUserInfo.splice(findIndex, 1);
        const newData = JSON.stringify({
            message: 'userLeave',
            currentUser: userInfo,
            data: arrUserInfo,
        });
        wss.clients.forEach(client => {
            if (client.readyState === WebSocketServer.OPEN) {
                client.send(newData);
            };
        });
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});

console.log("The WebSocket server is running on port 8080");