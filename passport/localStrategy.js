const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Users } = require('../schemas/usersSchema');

// 아이디, 패스를 이용한 local 로그인 모듈
module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'userPass',
    passReqToCallback: false // true로 설정할 경우 바로아래 userId 앞에 req 가 붙어야 함.
  }, async (userId, userPass, done) => { // done(서버실패, 성공유저, 로직실패)
    try {
      const user = await Users.findOne({ userId, provider: 'local' }).lean()
      if (user) {
        const isMatch = await bcrypt.compare(userPass, user.userPass)
        if (isMatch) { // 성공 시 로그인 요청했던 /user/signin 라우트로 정보 보내줌.
          done(null, user)
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
        }
      } else {
        done(null, false, { message: '존재하지 않는 사용자 입니다.' })
      }
    } catch (err) {
      console.error(err)
      done(err)
    }
  }))
}