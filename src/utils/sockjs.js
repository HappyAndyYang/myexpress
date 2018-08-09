import sockjs from 'sockjs';

/**
 * Create Sockjs server.
 */
const sockOpts = { sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' };
let sockServer;

class SockServer {
  constructor(server) {
    this.sockets = [];
    this.server = server;
  }

  listen() {
    const sockjsServer = sockjs.createServer(sockOpts);
    sockjsServer.installHandlers(this.server, { prefix: '/sockjs' });
    sockjsServer.on('connection', (conn) => {
      if (!conn) return;
      this.sockets.push(conn);

      conn.on('close', () => {
        const connIndex = this.sockets.indexOf(conn);
        if (connIndex >= 0) {
          this.sockets.splice(connIndex, 1);
        }
      });
    });
  }

  sockWrite(type, data) {
    this.sockets.forEach((sock) => {
      sock.write(JSON.stringify({
        type,
        data,
      }));
    });
  }
}

export const socket = (server) => {
  sockServer = new SockServer(server);
  sockServer.listen();
};

export const sockWrite = (type, data) => {
  if (sockServer) {
    sockServer.sockWrite(type, data);
  }
};
