require('dotenv').config() // 환경변수 사용 선언: 맨위에 위치하는 것이 좋다.

const express = require('express')
const app = express()
const morgan = require('morgan')
var cors = require('cors')
const port = process.env.REACT_APP_PORT
const { Errors } = require('./Model/errorsModel');

app.use(cors())

/**
 * dev(개발용), combined(배포용, 좀 더 자세함)
 * 서버에 과부하를 유도할 수도 있기에 production 에서 사용 안할려면 분기문 처리한다.
 */
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan(process.env.MORGAN_MODE))
}

// data 받기 옵션, body-parser 사용할 필요 없음, 파일은 multer 사용.
app.use(express.urlencoded({ extended: true })); // post로 보낸 form data를 받기 위함
app.use(express.json()) // To parse the incoming requests with JSON payloads

// mongoose
const { mongoose } = require('mongoose');

// routers
app.use('/', require('./router/appconfigRouter'));
app.use('/', require('./router/configsRouter'));
app.use('/', require('./router/groupsRouter'));
app.use('/', require('./router/categoriesRouter'));
app.use('/', require('./router/bookmarksRouter'));
app.use('/', require('./router/usersRouter'));
app.use('/', require('./router/boardRouter'));

// 404 Not Found : 라우트 가장 아래에 위치
app.all('*', (req, res, next) => {
  const err = new Error()
  err.message = `NotFound : ${req.method} ${req.url} 라우터가 없습니다.`
  err.status = 404
  next(err)
})

/**
 * 에러 처리 미들웨어: 반드시 4개 매개변수 모두 기재되어 있어야 함!
 * 보안상 화면에 노출 하지말고 에러 전용 디비 테이블이나 에러 전용 파일에 저장.
 * 이메일 알람등을 활용하는 것 권장.
 */
app.use(async (err, req, res, next) => {
  try {
    const data = {}
    const topRow = await Errors.findOne().sort({ idx: -1 })
    const idx = (topRow?.idx) ? parseInt(topRow.idx) + 1 : 1
    data.idx = idx
    data.userId = 'abc' // null 허용
    data.fullMessage = err
    await Errors.create(data)
  } catch (err) {
    console.log('[에러 저장실패] ' + err)
  } finally {
    res.status(err.status || 500)
    res.send('error')
  }
})

// mongoose
if (!process.env.MONGODB_URI) throw new Error('db connection uri error!')
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true); // 개발모드 시 콘솔에서 쿼리 출력됨.
}
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
    next(err);
  });