const jwt = require('jsonwebtoken');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader?.startsWith('Bearer ') && !authHeader?.startsWith('bearer ')) {
    return res.json({
      code: 401,
      message: '사용자 인증이 존재하지 않습니다.\n다시 로그인해주세요.',
      ok: false,
      result: null
    });
  }
  const accessToken = authHeader?.split(' ')[1]

  jwt.verify(
    accessToken,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.json({
            code: 419,
            message: '사용자 인증이 만료되었습니다.\n다시 로그인해주세요.',
            ok: false,
            result: null
          });
        }
        return res.json({
          code: 401,
          message: '유효하지 않은 토큰입니다.\n다시 로그인해주세요.',
          ok: false,
          result: null
        });
      }
      req.user = decoded.user
      next()
    })
}

module.exports = { verifyJWT }