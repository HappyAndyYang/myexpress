import express from 'express';
import socketClient from '../utils/socketClient';
import { sender, sender2, sender3, sender4, sender5, sender6 } from '../test/rabbitmqSend';
import { receiver, receiver2, receiver3, receiver4, receiver5, receiver6 } from '../test/rabbitmqReceiver';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res /* next */) => {
  socketClient(true, 'message');
  res.json({ index: 'index' });
});

router.get('/send', (req, res /* next */) => {
  // sender();
  // sender5(['kern.critical', 'A critical kernel error']);
  sender6([30]);
  res.json({ send: 'sender' });
});

router.get('/receive', (req, res /*  next */) => {
  // receiver();
  // receiver4(['warning', 'error']);
  // receiver5(['kern.*']);
  receiver6();
  res.json({ receive: 'receiver' });
});


module.exports = router;
