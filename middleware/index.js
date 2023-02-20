const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  try {
    res.decode = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: '사용자 인증이 만료되었습니다\n다시 로그인해주세요.',
      });
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 사용자 인증입니다.\n다시 로그인해주세요.',
    });
  }
}