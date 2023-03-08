/**
 * 참고 동영상 강의
 * https://www.youtube.com/watch?v=f2EqECiTBL8&t=18219s
 */
const jwt = require('jsonwebtoken')
const { Users } = require('../schemas/usersSchema');
const { getToken } = require('../common');

const handleRefreshToken = async (req, res, next) => {
  try {
    const cookies = req?.cookies
    if (!cookies?.rt) {
      return res.json({
        code: 401, // Unauthorized
        // message: '쿠키에 리플래시 토큰이 존재하지 않습니다.\n다시 로그인 해주세요.',
        message: '토큰이 존재하지 않습니다.\n다시 로그인 해주세요.',
        ok: false,
        result: null
      })
    }
    const refreshToken = await cookies.rt
    // DB에 보관하고 있는 refreshToken 과 현재의 refreshToken을 비교.
    const foundUser = await Users.findOne({ refreshToken }).lean().exec()
    if (!foundUser) {
      return res.json({
        code: 403, // Forbidden
        // message: '해당 토큰이 일치하는 refreshToken 필드값이 DB에 없습니다.',
        message: '해당 토큰에 해당하는 유저가 없습니다.',
        ok: false,
        result: null
      })
    }
    await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err || !decoded) {
          if (err.name === 'TokenExpiredError') {
            return res.json({
              code: 419,
              // message: '리플래시 토큰이 만료되었습니다.\n다시 로그인해주세요.',
              message: '사용자 인증이 만료되었습니다.\n다시 로그인해주세요.',
              ok: false,
              result: null
            });
          }
          return res.json({
            code: 401,
            // message: '유효하지 않은 리플래시 토큰입니다.\n다시 로그인해주세요.',
            message: '유효하지 않은 토큰입니다.\n다시 로그인해주세요.',
            ok: false,
            result: null
          });
        }
        // DB에 보관하고 있는 일치 된 refreshToken row의 아이디 비교.
        if (decoded.user !== foundUser._id.toString()) {
          // res.json() 만으로는 응답은 보내지만 함수는 종료되지 않는다!
          // 앞에 return을 붙여줘야 종료된다.
          // return res.json({}) 을 res.send({}) 로 대체해도 된다.
          return res.json({
            code: 403,
            // message: '해당 refreshToken 의 유저가 불일치 합니다.\n다시 로그인해주세요.',
            message: '사용하지 않는 토큰입니다.\n다시 로그인해주세요.',
            ok: false,
            result: null
          });
        }
        // 새로운 accessToken 발급
        const newAccessToken = getToken(
          decoded.user,
          process.env.JWT_SECRET,
          process.env.BASIC_SESSION_TIME
        )
        return res.json({
          code: 200,
          message: '',
          ok: true,
          result: newAccessToken
        });
      })
  } catch (err) {
    next(err)
  }
}

module.exports = { handleRefreshToken }