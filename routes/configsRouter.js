var router = require('express').Router();

const { verifyJWT } = require('../middlewares/verifyTokenMiddleware');
const { Configs } = require('../schemas/configsSchema');

router.post('/config/add', async (req, res, next) => {
  const params = req.body;
  const topRow = await Configs.findOne().sort({ idx: -1 })
  const idx = (topRow && topRow.idx) ? parseInt(topRow.idx) + 1 : 1
  params.idx = idx;
  await Configs.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      next(err);
    });
})

router.get('/configs', (req, res, next) => {
  Configs.find().sort({ idx: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

router.get('/myConfig', verifyJWT, (req, res, next) => {
  //const { userId } = req.params;
  const user = req.user;
  //const userId = 'abc';
  console.log("🚀 ~ file: configsRouter.js:29 ~ router.get ~ user:", user)
  Configs.findOne({ user })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
    })
})

router.put('/config/edit', (req, res, next) => {
  const { userId, startGroupIdx, appTitle, theme, isTargetBlank, isBasicSort } = req.body;
  Configs.findOneAndUpdate({ userId }, {
    $set: {
      startGroupIdx,
      appTitle,
      theme,
      isTargetBlank,
      isBasicSort
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    next(err)
  })
})

router.delete('/config/delete', (req, res, next) => {
  const { userId } = req.body;
  Configs.deleteMany({ userId })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      next(err)
    })
})

module.exports = router;