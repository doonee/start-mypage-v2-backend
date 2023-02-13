require('dotenv').config() // 환경변수: 맨위에 위치하는 것이 좋다.

const express = require('express')
const app = express()
const morgan = require('morgan')
var cors = require('cors')
const port = process.env.REACT_APP_PORT

app.use(cors())

app.use(morgan('dev')) // dev(개발용), combined(배포용, 좀 더 자세함)

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
app.all('*', (req, res) => {
  res.status(404).send('none')
})

// 에러 처리 미들웨어: 반드시 4개 매개변수 모두 기재되어 있어야 함!
// 노출 하지말고 에러 디비에 저장 및 이메일 알람등 활용
app.use((err, req, res, next) => {
  console.error(`[error middleware] ${err}`)
  next(err)
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