const whitelist = process.env.API_WHITE_LIST
const corsOptions = {
  origin: (origin, callback) => {
    // !origin은 '같은 도메인과 포트'로 추정.
    if (!origin || whitelist.indexOf(origin) !== -1) { // allow
      callback(null, true)
    } else { // not allow
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

module.exports = corsOptions