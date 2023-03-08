const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { Users } = require('../schemas/usersSchema'); // { Users } 괄호로 꼭 감쌀것!

module.exports = () => {
  // [서버에서 쿠키 만들기] Serialize :
  // 유저 정보를 압축하여 쿠키로 만들어준다.
  passport.serializeUser((user, done) => {
    // 서버는 session object {세션쿠키: 유저아이디} 형태로 req.session 메모리에 저장후
    // 사용자의 브라우저에 connect.sid 이름으로 세션쿠키를 전송한다.
    // req.session 에 별도의 정보를 추가할 수 있다.
    done(null, user._id);
  });

  // [브라우저에 보내기] Deserialize :
  // 사용자의 브라우저에 있는 session cookie를 가지고 와서
  // http request 라는 객체에 user 라는 키를 담아서 매번 보내준다.(req.user)
  // 모든 라우트 에서는 req.user를 사용할 수 있다.
  // deserializeUser는 가장 먼저 매 페이지마다 실행된다.
  passport.deserializeUser((id, done) => {
    Users.findOne({ _id: id }).lean()
      .then(user => {
        done(null, user) // req.user
      })
      .catch(err => done(err))
  })

  local()
}