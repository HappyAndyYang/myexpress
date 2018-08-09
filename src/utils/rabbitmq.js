import { connect } from 'amqplib';
import Promise from 'bluebird';
import uuid from 'uuid';
import { getLogger } from 'log4js';
import {
  username, password, host, port,
} from '../config/rabbitmq';

const log = getLogger('rabbitmq');

// const open = amqp.connect(`amqp://${username}:${password}@${host}:${port}`);
async function rabbitmq(req, res) {
  try {
    // const ch = await open.then(conn => conn.createChannel());
    const conn = await connect(`amqp://${username}:${password}@${host}:${port}`);
    const ch = await conn.createChannel();

    const {
      // operator,
      actionId, // ↑需要剔除的属性
      dataType,
      cmd,
      ...data
    } = req.body;
    const send = JSON.stringify(data);

    // debug start
    if (process.env.NODE_ENV === 'test') {
      const head = {
        headers: {
          __TypeId__: dataType,
          cmd,
        },
        appId: 'uweb',
      };
      log.info('[Rabbitmq Header] - ', head);
      log.info('[Rabbitmq Send] - ', send);
      return;
    }
    // debug end
    log.info('[Rabbitmq Send] - ', send);
    return new Promise((resolve) => {
      const corrId = uuid();

      function maybeAnswer(msg) {
        if (msg.properties.correlationId === corrId) {
          resolve(msg.content.toString());
        }
      }

      ch.assertQueue('', {
        exclusive: true,
      })
        .then(qok => qok.queue)
        .then(queue => ch.consume(queue, maybeAnswer, {
          noAck: true,
        })
          .then(() => queue))
        .then((queue) => {
          const header = {
            headers: {
              __TypeId__: dataType,
              cmd,
            },
            correlationId: corrId,
            replyTo: queue,
            contentType: 'application/json',
            appId: 'uweb',
          };
          log.debug('[Rabbitmq Header] - ', header);
          ch.sendToQueue('usmsweb.rpc.queue', Buffer.from(send), header);
        });
    })
      .then((reply) => {
        log.info('[Rabbitmq Reply] - ', reply);
        res.json(JSON.parse(reply));
      })
      .finally(() => {
        conn.close();
      });
  } catch (err) {
    log.error('[Rabbitmq Error] - ', err);
  }
}

export default rabbitmq;
