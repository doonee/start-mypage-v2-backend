/**
 * 참고 동영상 강의
 * https://www.youtube.com/watch?v=f2EqECiTBL8&t=18219s
 */
const jwt = require('jsonwebtoken')
const { Users } = require('../schemas/usersSchema');
const { getToken } = require('../common');
const bcrypt = require('bcrypt');

const handleSignIn = async (req, res, next) => {
  try {
    const params = req.body;
    const { userId, userPass } = params;
    const user = await Users.findOne({ userId }).lean().exec()
    if (!user) {
      return res.send({
        code: 401,
        message: '존재하지 않는 사용자 입니다.',
        ok: false,
        result: null
      })
    }
    if (user.isDeleted) {
      return res.send({
        code: 419,
        message: '계정 정지된 사용자 입니다.',
        ok: false,
        result: null
      })
    }
    const isMatch = await bcrypt.compare(userPass, user.userPass)
    if (!isMatch) {
      return res.send({
        code: 403,
        message: '비밀번호가 일치하지 않습니다.',
        ok: false,
        result: null
      })
    }

    const accessToken = await getToken(
      user._id,
      process.env.JWT_SECRET,
      // parseInt(process.env.BASIC_SESSION_TIME),
      '60000' // test: 1분
    )
    // res.cookie(
    //   'at',
    //   accessToken,
    //   {
    //     httpOnly: true,
    //     maxAge: parseInt(process.env.BASIC_SESSION_TIME),
    //     // maxAge: 60000 // test: 1분
    //   }
    // )

    const refreshToken = await getToken(
      user._id,
      process.env.JWT_REFRESH_SECRET,
      // parseInt(process.env.UNLIMITED_SESSION_TIME),
      180000 // test: 3분
    )
    await Users.findByIdAndUpdate({ _id: user._id }, {
      $set: {
        refreshToken
      }
    })
    res.cookie(
      'rt',
      refreshToken,
      {
        httpOnly: true,
        // maxAge: parseInt(process.env.UNLIMITED_SESSION_TIME),
        maxAge: 180000 // test: 3분
      }
    )

    return res.send({
      code: 200,
      message: '로그인 되었습니다.',
      ok: true,
      result: accessToken
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { handleSignIn }