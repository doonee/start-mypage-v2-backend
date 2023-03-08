/**
 * 2초마다 로그 남기는 테스트
 */
const logEvents = require('../middlewares/logEvents')
const EventEmitter = require('events')

class MyEmitter extends EventEmitter { };

const myEmitter = new MyEmitter();

myEmitter.on('log', (msg) => logEvents(msg))

setInterval(() => {
  myEmitter.emit('log', '..', 'log event emitted!')
}, 2000); 