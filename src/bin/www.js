#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('sweetser:server');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { socket } = require('../utils/sockjs');

/**
 * make a log directory, just in case it isn't there
 */
try {
  fs.mkdirSync(path.join(__dirname, '../logs'));
} catch (error) {
  if (error.code !== 'EEXIST') {
    console.error('Could not set up log directory, error was: ', e); // eslint-disable-line
    process.exit(1);
  }
}

/**
 * initialise log4js first, so we don't miss any log message
 */
const log4js = require('log4js');
const log4jsConf = require('../config/log4js');
log4js.configure(log4jsConf);
const log = log4js.getLogger('startup');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Install Handlers
 */
socket(server);

/**
 * Listen on provided port, on all network interfaces.
 */

//server.listen(port);
server.listen(port, '0.0.0.0', () => {
  log.info('Express server listening on port ', server.address().port, ' with pid ', process.pid);
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const nport = parseInt(val, 10);

  if (Number.isNaN(nport)) {
    // named pipe
    return val;
  }

  if (nport >= 0) {
    // port number
    return nport;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = server;
