/**
 * 참고 동영상 강의
 * https://www.youtube.com/watch?v=f2EqECiTBL8&t=18219s
 */
const jwt = require('jsonwebtoken')
const { Users } = require('../schemas/usersSchema');
const { getToken } = require('../common');

const handleSignOut = async (req, res, next) => {
  try {
    const cookies = await req.cookies
    console.log("🚀 ~ file: signOutController.js:9 ~ handleSignOut ~ cookies:", cookies)
    if (!cookies?.rt) {
      return res.json({
        code: 204, // No content
        message: '쿠키가 없습니다.',
        ok: true,
        result: null
      })
    }
    const refreshToken = cookies.rt
    // DB에서 현재의 refreshToken과 같은 refreshToken 찾아서 초기화
    const foundUser = await Users.findOne({ refreshToken }).lean().exec()
    if (!foundUser) { // DB에 없을 경우
      // await res.clearCookie('at', { httpOnly: true }) // accessToken 쿠키 초기화
      await res.clearCookie('rt', { httpOnly: true }) // refreshToken 쿠키 초기화
      return res.json({
        code: 204, // No content
        message: '해당 토큰은 사용되지 않습니다.', // DB 에 없음.
        ok: true,
        result: null
      })
    }
    // DB에 있을 경우
    await Users.findOneAndUpdate({ refreshToken }, {
      $set: {
        refreshToken: '' // DB refreshToken 초기화
      }
    })
    // await res.clearCookie('at', { httpOnly: true }) // accessToken 쿠키 초기화
    await res.clearCookie('rt', { httpOnly: true }) // refreshToken 쿠키 초기화
    // res.cookie(
    //   'jwt',
    //   '',
    //   {
    //     httpOnly: true,
    //   }
    // )
    return res.json({
      code: 200,
      message: '로그아웃 되었습니다.',
      ok: true,
      result: null
    });
  } catch (err) {
    next(err)
  }
}

module.exports = { handleSignOut }