var router = require('express').Router();
const { Users } = require('../Model/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { auth } = require('../middleware')

router.post('/user/add', async (req, res, next) => {
  const params = req.body;
  const { userId, userPass } = params;
  const isExist = await Users.find({ userId }).lean();
  if (isExist?.length) {
    res.send('사용 중인 유저아이디 입니다.')
    return // return 안해주면 콘솔창에 에러메시지 출려됨!
  }
  const hashedPassword = await bcrypt.hash(userPass, 12)
  const topRow = await Users.findOne().sort({ idx: -1 }).lean()
  const idx = (topRow?.idx) ? parseInt(topRow.idx) + 1 : 1
  const data = {
    userId,
    userPass: hashedPassword,
    idx
  }
  await Users.create(data)
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      next(err);
    });
})

router.get('/users', auth, (req, res, next) => {
  Users.find().sort({ idx: -1 }).limit(20).lean() // -1 = desc
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      next(err)
    });
})

router.get('/user/:id', (req, res, next) => {
  const { id } = req.params;
  Users.findOne({ _id: id }).lean()
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
    })
})

router.post('/user/signin', async (req, res, next) => {
  try {
    const params = req.body;
    const { userId, userPass } = params;
    const user = await Users.findOne({ userId }).lean()
    if (!user) {
      res.send('존재하지 않는 사용자 입니다.')
      return
    }
    const isMatch = await bcrypt.compare(userPass, user.userPass)
    if (!isMatch) {
      res.send('비밀번호가 일치하지 않습니다.')
      return
    }

    const token = jwt.sign(
      {
        username: user.userId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m', // 만료시간 15분
        issuer: 'startmypage.com',
      }
    );

    return res.send({
      result: 'ok',
      token
    });
  } catch (err) {
    next(err);
  }
})

router.put('/user/edit', (req, res, next) => {
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

router.delete('/user/delete', (req, res, next) => {
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