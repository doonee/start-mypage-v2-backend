// Cross Origin Resource Sharing
// const whitelist = ['http://localhost:3000',
//   'http://127.0.0.1:3000',
//   'https://start-mypage-v2.vercel.app',
//   'https://web-start-mypage-v2-sop272gldb39yr3.gksl2.cloudtype.app']

const whitelist = process.env.API_WHITE_LIST
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

module.exports = corsOptions