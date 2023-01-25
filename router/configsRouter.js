var router = require('express').Router();

const { Configs } = require('../Model/configsModel');

router.post('/config/add', async (req, res) => {
  const params = req.body;
  const topRow = await Configs.findOne().sort({ idx: -1 })
  const idx = (topRow && topRow.idx) ? parseInt(topRow.idx) + 1 : 1
  params.idx = idx;
  await Configs.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/configs', (req, res) => {
  Configs.find().sort({ idx: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/config/:userId', (req, res) => {
  const { userId } = req.params;
  Configs.findOne({ userId })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

router.put('/config/edit', (req, res) => {
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
    res.send('error')
  })
})

router.delete('/config/delete', (req, res) => {
  const { userId } = req.body;
  Configs.deleteMany({ userId })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      console.err(err)
      res.send('error')
    })
})

module.exports = router;