var router = require('express').Router();

const { Board } = require('../Model/boardModel');

router.post('/board/add', async (req, res) => {
  const params = req.body;
  const topRow = await Board.findOne().sort({ idx: -1 })
  const idx = (topRow && topRow.idx) ? parseInt(topRow.idx) + 1 : 1
  params.idx = idx
  await Board.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/board', (req, res) => {
  Board.find().sort({ idx: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/board/:id', (req, res) => {
  const { id } = req.params;
  Board.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

router.put('/board/edit', (req, res) => {
  const { id, title, content } = req.body;
  Board.findOneAndUpdate({ _id: id }, {
    $set: {
      title,
      content
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.send('error')
  })
})

router.delete('/board/delete', (req, res) => {
  const { id } = req.body;
  Board.deleteOne({ _id: id })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      console.err(err)
      res.send('error')
    })
})

module.exports = router;