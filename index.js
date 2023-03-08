const express = require('express')
const app = express()
const dotenv = require('dotenv')
dotenv.config() // 환경변수 사용 선언: 맨위에 위치하는 것이 좋다.
const port = process.env.REACT_APP_PORT
const morgan = require('morgan')
var cors = require('cors') // Cross Origin Resource Sharing
const corsOptions = require('./config/corsOptions')
const { Errors } = require('./schemas/errorsSchema')
const { logSave, logger, errorHandler } = require('./middlewares/logEventMiddleware')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const passportConfig = require('./passport')
passportConfig()
const helmet = require('helmet') // 서버 보안
const hpp = require('hpp') // 서버 보안

app.use(logger)

app.use(cors(corsOptions))

/**
 * dev(개발용), combined(배포용)
 * 서버에 과부하를 유도할 수도 있기에 production 에서 사용 안할려면 분기문 처리한다.
 */
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })) // 엄격한 옵션들: 일단 꺼두는게 오류가 덜 남.
  app.use(hpp())
  app.use(morgan(process.env.MORGAN_MODE || 'combined'))
  app.enable('trust proxy')
} else {
  app.use(morgan(process.env.MORGAN_MODE))
}

// data 받기 옵션, body-parser 사용할 필요 없음, 파일은 multer 사용.
// raw(), text()는 거의 사용안함.
app.use(express.urlencoded({ extended: true })) // post로 보낸 form data를 받기 위함
app.use(express.json()) // To parse the incoming requests with JSON payloads

app.use(cookieParser(process.env.COOKIE_SESSION_PASS)) // 쿠키와 세션의 암호를 같게 하는 것이 편하다.
// The default value is { path: '/', httpOnly: true, secure: false, maxAge: null }.
// https://www.npmjs.com/package/express-session
const sessionOption = {
  // cookieName: 'sessionName',
  secret: process.env.COOKIE_SESSION_PASS,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // 자바스크립트에서 접근못하는 옵션. application에 저장 안됨.
    secure: false, // https 에서만 사용할지 여부, https 만 사용할거면 배포 전에 true로 변경.
    //ephemeral: true, // delete this cookie while browser close
    //expires: new Date(Date.now() + 1000 * 60 * 30), // 30분
  },
}
if (process.env.NODE_ENV === 'production') {
  // sessionOption.proxy=true
  // sessionOption.cookie.secure=true // https 사용하면 주석 풀기
}
app.use(session(sessionOption))
// passport use는 반드시 session 아래에 위치해야 한다!
app.use(passport.initialize()) // passport 객체 생성 : 
// req.user, req.login, req.isAuthenticate, req.logout...
app.use(passport.session()) // connect.sid 라는 이름으로 세션 쿠키가 브라우저로 전송.

// mongoose
// const { mongoose } = require('mongoose')

// // 공통으로 사용할 변수들??
// app.use((req, res, next) => {
//   req.session.jwt = null
//   res.locals.decoded = null
//   console.log("🚀 ~ file: usersRouter.js:11 ~ router.use ~ req.session:", req.session)
//   console.log("🚀 ~ file: usersRouter.js:12 ~ router.use ~ req.user:", req.user)
//   next()
// })

// routers
app.use('/', require('./routes/appconfigRouter'));
app.use('/', require('./routes/configsRouter'));
app.use('/', require('./routes/groupsRouter'));
app.use('/', require('./routes/categoriesRouter'));
app.use('/', require('./routes/bookmarksRouter'));
app.use('/', require('./routes/usersRouter'));
app.use('/', require('./routes/boardRouter'));
app.use('/', require('./routes/errorsRouter'));

// 404 Not Found : 라우트 가장 아래에 위치
app.all('*', (req, res, next) => {
  const err = new Error()
  err.message = 'Wrong url!'
  err.devMessage = `NotFound : '${req.method}' '${req.url}' 라우터가 없습니다.`
  err.status = 404
  next(err)
})

app.use(errorHandler)

// 에러 감지만 가능, 고쳐주지는 못함.
// DB에 저장되는지 테스트중...
process.on('uncaughtException', err => {
  console.error('[uncaughtException error] => ', err)
})

// mongoose
const { mongoose } = require('mongoose')
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
    console.error(err)
  });