const jwt = require('jsonwebtoken');

exports.getToken = (userId, secret, expiresIn) => {
  return jwt.sign(
    {
      user: userId
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: expiresIn,
      issuer: 'startmypage.com',
    }
  );
}

exports.getResignToken = (userId) => {
  let result = null
  const reSessionTime = parseInt(process.env.BASIC_SESSION_TIME)
  const jwt = jwt_decode(JsonLocalStorage.getItem('u'))
  if (jwt?.exp) {
    const deepCopiedJwt = JSON.parse(JSON.stringify(jwt))
    const token_exp_date = new Date(jwt.exp * 1000)
    const token_copied_date = new Date(deepCopiedJwt.exp * 1000)
    const token_resign_date = new Date(AddMinute(token_copied_date, -reSessionTime))
    const current_date = new Date(new Date())
    // 만료 20분 전
    if (token_resign_date < current_date && current_date < token_exp_date) {
      result = getToken(userId, reSessionTime)
    }
  }
  return result
}