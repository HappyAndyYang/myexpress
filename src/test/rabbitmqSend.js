import amqp from 'amqplib/callback_api';
import { connect } from 'amqplib';

export async function sender() {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.log(err);
    } else {
      conn.createChannel((err1, channel) => {
        if (err1) {
          console.log(err1);
        } else {
          const msg = 'hello world!';
          channel.assertQueue(msg, { durable: false });
          channel.sendToQueue(msg, Buffer.from('Hello World!!!'));
          console.log(" [x] Send 'Hello World!!!' ");
        }
      });
      setTimeout(() => {
        conn.close();
        // process.exit(0);
      }, 10000);
    }
  });
}

export async function sender2() {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.log(err);
    } else {
      conn.createChannel((err1, channel) => {
        if (err1) {
          console.log(err1);
        } else {
          const q = 'task_queue';
          const msg = process.argv.slice(2).join(' ') || 'Hello Word--......';
          channel.assertQueue(q, { durable: true });
          channel.sendToQueue(q, Buffer.from(msg), { persistent: true });
          console.log(" [x] Send2 '%s' ", msg);
        }
      });
      setTimeout(() => {
        conn.close();
      }, 1000);
    }
  });
}

export async function sender3() {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.log(err);
    } else {
      conn.createChannel((err1, channel) => {
        if (err1) {
          console.log(err1);
        } else {
          const ex = 'logs';
          const msg = process.argv.slice(2).join(' ') || 'Hello Rabbit!';
          channel.assertExchange(ex, 'fanout', { durable: false });
          channel.publish(ex, '', Buffer.from(msg));
          console.log(' [x] Send %s', msg);
        }
      });
      setTimeout(() => {
        conn.close();
      }, 2000);
    }
  });
}

export async function sender4() {
  const conn = await connect('amqp://localhost');
  const channel = await conn.createChannel();
  const ex = 'direct_logs';
  // const args = process.argv.slice(2);
  const args = ['error', 'warning'];
  const msg = args.slice(0).join(' ') || 'Hello direct!';
  console.log('msg: ', msg);
  const severity = (args.length > 0) ? args[0] : 'info';
  channel.assertExchange(ex, 'direct', { durable: false });
  channel.publish(ex, severity, Buffer.from(msg));
  setTimeout(() => conn.close(), 2000);
}

export async function sender5(args) {
  const conn = await connect('amqp://localhost');
  const channel = await conn.createChannel();
  const ex = 'topic_logs';
  const key = (args.length > 0) ? args[0] : 'anonymouse.info';
  const msg = args.slice(1).join(' ') || 'Hello Topic!';
  channel.assertExchange(ex, 'topic', { durable: false });
  channel.publish(ex, key, Buffer.from(msg));
  console.log(" [x] Sent %s:'%s'", key, msg);
  setTimeout(() => conn.close(), 2000);
}

export async function sender6(args) {
  const conn = await connect('amqp://localhost');
  const channel = await conn.createChannel();
  const q = await channel.assertQueue('', { exclusive: true });
  const corr = await generateUuid();
  const num = parseInt(args[0], 0);
  channel.consume(q.queue, (msg) => {
    if (msg.properties.correlationId === corr) {
      console.log(' [x] Requesting fib(%d)', num);
      setTimeout(() => conn.close(), 2000);
    }
  }, { noAck: true });
  channel.sendToQueue('rpc_queue',
    Buffer.from(num.toString()),
    {
      correlationId: corr,
      replyTo: q.queue,
    });
}

async function generateUuid() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}
