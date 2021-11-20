const WebSocket = require('ws')
const {v4: uuidv4} = require('uuid')
 
const wsServer = new WebSocket.Server({ port: 8080 })
let allUsers = []; // [{userID: 'asdasd-asdasd-asd', socketRef: socketReference, status: 'online'}]

wsServer.on('connection', ws => {
  console.log('[connect]::allUsers:: ', JSON.stringify(allUsers.map((elem) => {elem.userID, elem.status})));

  ws.isAlive = true;
  ws.on('pong', function heartbeat() { this.isAlive = true; });

  ws.on('message', (data) => {
    console.log('user message:: ', data.toString('utf8'));
    let message = JSON.parse(data);

    if (message.event === 'USER_CONNECTED') {
      if (message.data.isNewUser) {
        let userID = uuidv4();
        ws.send(JSON.stringify({event: 'NEW_USER_UUID', data: {uuid: userID} }));

        allUsers.push({userID: userID, socketRef: ws, status: 'online'});
      } else {
        let userID = message.data.userID;

        allUsers = allUsers.map((elem, index) => {
          if (elem.userID === userID) {
            return {...elem, status: 'online'}
          }
          return {...elem};
        });
      }

      // wsServer.clients.forEach((client) => {
      //   if (client.readyState === WebSocket.OPEN) {
      //     client.send(JSON.stringify(message));
      //   }
      // });
    } else if (message.event === 'NEW_MESSAGE') {
      // broadcast to everyone except sender
      wsServer.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }

  });

});

// ref: https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
const interval = setInterval(function ping() {
  wsServer.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {

      allUsers = allUsers.map((elem, index) => {
        if (elem.socketRef === ws) {
          return {...elem, status: 'offline'}
        }
        return {...elem};
      });

      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wsServer.on('close', () => {
  clearInterval(interval);
  console.log('[close]::allUsers:: ', JSON.stringify(allUsers.map((elem) => {elem.userID, elem.status})) );
});