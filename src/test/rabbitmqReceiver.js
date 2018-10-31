import amqp from 'amqplib/callback_api';
import { connect } from 'amqplib';

export async function receiver() {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.log(err);
    } else {
      const msg = 'hello world!';
      conn.createChannel((err1, channel) => {
        if (err1) {
          console.log(err1);
        } else {
          channel.assertQueue(msg, { durable: false });
          console.log(' [*] Waiting for message in %s, To exit press CTRL+C ', msg);
          channel.consume(msg, (message) => {
            console.log(' [x]  received %s ', message.content.toString());
          }, { noAck: true });
        }
      });
    }
  });
}

export async function receiver2() {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.log(err);
    } else {
      conn.createChannel((err1, channel) => {
        if (err1) {
          console.log(err1);
        } else {
          const q = 'task_queue';
          channel.assertQueue(q, { durable: true });
          channel.prefetch(1);
          console.log(' [*] Waiting for message in %s. To exit press CTRL+C', q);
          channel.consume(q, (msg) => {
            const secs = msg.content.toString().split('.').length - 1;
            console.log(' [x] received %s ', msg.content.toString());
            setTimeout(() => {
              console.log(' [x] Done');
              channel.ack(msg);
            }, secs * 1000);
          }, { noAck: false });
        }
      });
    }
  });
}

export async function receiver3() {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.log(err);
    } else {
      conn.createChannel((err1, channel) => {
        const ex = 'logs';
        channel.assertExchange(ex, 'fanout', { durable: false });
        channel.assertQueue('', { exclusive: true }, (err2, q) => {
          if (err2) {
            console.log(err2);
          } else {
            console.log(' [*] Waiting for message in %s. To exit press CTRL+C ', q.queue);
            channel.bindQueue(q.queue, ex, '');
            channel.consume(q.queue, (msg) => {
              console.log(' [x] receivers %s', msg.content.toString());
            }, { noAck: true });
          }
        });
      });
    }
  });
}

export async function receiver4(args) {
  // const args = process.argv.slice(2);
  // if (args.length === 0) {
  //   console.log('Usage: receive_logs_direct.js [info] [warning] [error]');
  //   process.exit(1);
  // }
  const conn = await connect('amqp://localhost');
  const channel = await conn.createChannel();
  const ex = 'direct_logs';
  channel.assertExchange(ex, 'direct', { durable: false });
  const q = await channel.assertQueue('', { exclusive: true });
  console.log(' [*] Waiting for logs. To exit press CTRL+C ');
  args.map((item) => {
    channel.bindQueue(q.queue, ex, item);
  });
  channel.consume(q.queue, (msg) => {
    console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
  }, { noAck: true });
}

export async function receiver5(args) {
  const conn = await connect('amqp://localhost');
  const channel = await conn.createChannel();
  const ex = 'topic_logs';
  channel.assertExchange(ex, 'topic', { durable: false });
  const q = await channel.assertQueue('', { exclusive: true });
  console.log(' [*] Waiting for logs. To exit press CTRL+C ');
  args.map((item) => {
    channel.bindQueue(q.queue, ex, item);
  });
  channel.consume(q.queue, (msg) => {
    console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
  }, { noAck: true });
}

export async function receiver6() {
  const conn = await connect('amqp://localhost');
  const channel = await conn.createChannel();
  const q = 'rpc_queue';
  channel.assertQueue(q, { durable: false });
  channel.prefetch(1);
  console.log(' [x] Awaiting RPC requests');
  channel.consume(q, async (msg) => {
    const n = parseInt(msg.content.toString(), 0);
    console.log(' [.] fib(%d)', n);
    const r = await fibonacci(n);
    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(r.toString()),
      { correlationId: msg.properties.correlationId },
    );
    channel.ack(msg);
  });
}

async function fibonacci(n) {
  if (n === 0 || n === 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}
