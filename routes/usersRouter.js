var router = require('express').Router();
const { Users } = require('../schemas/usersSchema');
const bcrypt = require('bcrypt');
const { isNotLoggedIn, isLoggedIn } = require('../middlewares/verifyLoginMiddleware');
const { getToken } = require('../common');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { verifyJWT } = require('../middlewares/verifyTokenMiddleware');
const signInController = require('../controllers/signInController')
const refreshTokenController = require('../controllers/refreshTokenController')
const signOutController = require('../controllers/signOutController')

// 공통으로 사용할 변수들??
// router.use((req, res, next) => {
//   req.session.jwt = null
//   res.locals.decoded = null
//   console.log("🚀 ~ file: usersRouter.js:11 ~ router.use ~ req.session:", req.session)
//   console.log("🚀 ~ file: usersRouter.js:12 ~ router.use ~ req.user:", req.user)
//   next()
// })

router.post('/user/add', isNotLoggedIn, async (req, res, next) => {
  try {
    const params = req.body;
    const { userId, userPass } = params;
    if (!userId || !userPass) {
      // res.status(400).send('아이디와 패스워드는 필수항목 입니다.')
      // return // return 안해주면 콘솔창에 에러메시지 출력됨!
      // return res.status(400).send('아이디와 패스워드는 필수항목 입니다.')
      // status(400)를 임의로 기재해주면 프론트 catch 에서 임의의 에러를 생성한다.
      // status를 붙여주지 않는 것이 보안에 유리. => 기본값 200번으로 넘기기
      return res.send('아이디와 패스워드는 필수항목 입니다.')
    }
    const isExist = await Users.find({ userId }).lean().exec()
    if (isExist?.length) {
      // return res.status(409).send('사용 중인 유저아이디 입니다.')
      return res.send('사용 중인 유저아이디 입니다.')
    }
    const hashedPassword = await bcrypt.hash(userPass, 12)
    const topRow = await Users.findOne().sort({ idx: -1 }).lean().exec()
    const idx = (topRow?.idx) ? parseInt(topRow.idx) + 1 : 1
    const data = {
      userId,
      userPass: hashedPassword,
      idx
    }
    await Users.create(data)
    res.send('ok')
  } catch (err) {
    next(err);
  }
})

// [백업: 2023-02-22]
// router.post('/user/signin', isNotLoggedIn, async (req, res, next) => {
//   try {
//     const params = req.body;
//     const { userId, userPass } = params;
//     const user = await Users.findOne({ userId }).lean().exec()
//     if (!user) {
//       res.send('존재하지 않는 사용자 입니다.')
//       return
//     }
//     const isMatch = await bcrypt.compare(userPass, user.userPass)
//     if (!isMatch) {
//       res.send('비밀번호가 일치하지 않습니다.')
//       return
//     }
//     return res.send({
//       code: 200,
//       ok: true,
//       msg: '토큰이 발급되었습니다.',
//       token: getToken(user.userId)
//     });
//   } catch (err) {
//     next(err);
//   }
// })

// router.post('/user/signin', isNotLoggedIn, async (req, res, next) => {
//   try {
//     const params = req.body;
//     const { userId, userPass } = params;
//     const user = await Users.findOne({ userId }).lean().exec()
//     if (!user) {
//       return res.send({ result: '존재하지 않는 사용자 입니다.' })
//     }
//     if (user.isDeleted) {
//       return res.send({ result: '계정 정지된 사용자 입니다.' })
//     }
//     const isMatch = await bcrypt.compare(userPass, user.userPass)
//     if (!isMatch) {
//       return res.send({ result: '비밀번호가 일치하지 않습니다.' })
//     }
//     const accessToken = await getToken(
//       user._id,
//       process.env.JWT_SECRET,
//       // parseInt(process.env.BASIC_SESSION_TIME)
//       '10s' // test
//     )
//     const refreshToken = await getToken(
//       user._id,
//       process.env.JWT_REFRESH_SECRET,
//       // parseInt(process.env.UNLIMITED_SESSION_TIME)
//       '30s' // test
//     )

//     await Users.findByIdAndUpdate({ _id: user._id }, {
//       $set: {
//         refreshToken
//       }
//     })

//     res.cookie(
//       'jwt',
//       refreshToken,
//       {
//         httpOnly: true,
//         maxAge: parseInt(process.env.UNLIMITED_SESSION_TIME)
//       })
//     return res.send({ code: 200, message: '', ok: true, result: accessToken });
//   } catch (err) {
//     next(err);
//   }
// })

router.post('/user/signin', isNotLoggedIn, signInController.handleSignIn)

router.get('/user/refreshToken', refreshTokenController.handleRefreshToken)

router.get('/user/signout', signOutController.handleSignOut)

// // [백업 2023-02-27] 세션쿠키 활용
// router.post('/user/signin', isNotLoggedIn, (req, res, next) => {
//   passport.authenticate('local', (authError, user, info) => { // localStrategy.js로 로그인 요청
//     if (authError) { // 서버실패
//       console.error(authError);
//       return next(authError);
//     }
//     if (!user) { // 로직실패
//       console.error(info.message);
//       return next(authError);
//     }
//     return req.login(user, (loginError) => { // 성공한 로그인 반환정보를 passport.serializeUser 로 저장.
//       if (loginError) {
//         console.error(loginError);
//         return next(loginError);
//       }
//       return res.send(req.session.id);
//     });
//   })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
// })

// // 클라이언트 connect.sid 와 api의 세션쿠키 연결을 없애는 것.
// // 해당 세션쿠키의 값을 초기화 {} 한다.
// router.get('/user/signout', (req, res, next) => {
//   req.logout(() => { res.send('ok') })
// })

//router.get('/users/:count', isLoggedIn, (req, res, next) => {
router.get('/users/:count', (req, res, next) => {
  Users.find().sort({ idx: -1 }).limit(req.params.count).lean().exec()
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      next(err)
    });
})

router.get('/user/:id', isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  Users.findOne({ _id: id }).lean().exec()
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
    })
})

router.put('/user/edit', isLoggedIn, (req, res, next) => {
  const { id, userPass } = req.body;
  Users.findOneAndUpdate({ _id: id }, {
    $set: {
      userPass
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    next(err)
  })
})

router.delete('/user/delete', isLoggedIn, (req, res, next) => {
  const { id } = req.body;
  Users.deleteOne({ _id: id })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      next(err)
    })
})

module.exports = router;