const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) { // passport 통해서 로그인 한 상태
    next()
  } else {
    res.status(403).send('로그인 필요')
  }
}

const isNotLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(403).send('로그온 상태입니다.')
  } else {
    next()
  }
}

module.exports = { isLoggedIn, isNotLoggedIn }