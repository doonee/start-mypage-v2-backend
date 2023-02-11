const express = require('express')
const app = express()
var cors = require('cors')
require('dotenv').config()
const port = process.env.REACT_APP_PORT

app.use(cors())

// // post로 보내는 값 받는 옵션
// const { urlencoded } = require('express')
// var bodyParser = require('body-parser')

// post로 보내는 값 받는 옵션
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) // To parse the incoming requests with JSON payloads

// // moment
// const moment = require('moment')
// moment.locale('ko')

// // locals 설정
// app.use((req, res, next) => {
//   // moment : 클라이언트에서 별도의 설정 없이 moment 문법을 그대로 활용할 수 있다. 
//   res.locals.moment = moment
//   next()
// })

// mongoose
const { mongoose } = require('mongoose');

// routers
app.use('/', require('./router/boardRouter'));
app.use('/', require('./router/usersRouter'));
app.use('/', require('./router/appconfigRouter'));
app.use('/', require('./router/configsRouter'));
app.use('/', require('./router/groupsRouter'));
app.use('/', require('./router/categoriesRouter'));
app.use('/', require('./router/bookmarksRouter'));

// 404 Not Found : 라우트 가장 아래에 위치
app.all('*', (req, res) => {
  res.status(404).send('none')
})

// 놓친 에러 체크: 반드시 4개 매개변수 모두 기재되어 있어야 함!
// 노출 하지말고 에러 디비에 저장 및 이메일 알람등 활용
app.use((err, req, res, next) => {
  console.error(`[error middleware] ${err}`)
  res.send('error')
})

// mongoose
if (!process.env.MONGODB_URI) throw new Error('db connection error...')
mongoose
  .set('strictQuery', true) // 없으면 경고 발생함!
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connecting MongoDB...");
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });