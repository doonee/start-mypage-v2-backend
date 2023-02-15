var router = require('express').Router();

const { Users } = require('../Model/usersModel');

router.post('/user/add', async (req, res, next) => {
  const params = req.body;
  const topRow = await Users.findOne().sort({ idx: -1 })
  const idx = (topRow?.idx) ? parseInt(topRow.idx) + 1 : 1
  params.idx = idx;
  await Users.create(params)
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      next(err);
    });
})

router.get('/users', (req, res, next) => {
  Users.find().sort({ idx: -1 }) // -1 = desc
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      next(err)
    });
})

router.get('/user/:id', (req, res, next) => {
  const { id } = req.params;
  Users.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
    })
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
    console.error(err)
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