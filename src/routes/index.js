import express from 'express';
import socketClient from '../utils/socketClient';

const router = express.Router();

/* GET home page. */
router.get('/', (/* req, res, next */) => {
  socketClient(true, 'message');
});

module.exports = router;
