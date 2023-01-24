var router = require('express').Router();
const { startSession } = require('mongoose');
const { Bookmarks } = require('../Model/bookmarksModel');

router.post('/bookmark/add', async (req, res) => {
  const params = req.body
  // data 옮긴 후 idx 방식으로 자동증가 되게 변경해야 함!
  await Bookmarks.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/bookmarks', (req, res) => {
  Bookmarks.find().sort({ sortNo: 1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/bookmark/:id', (req, res) => {
  const { id } = req.params;
  Bookmarks.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

router.put('/bookmark/edit', (req, res) => {
  const { _id, categoryNo, bookmarkName, sortNo, isPublic } = req.body;
  Bookmarks.findOneAndUpdate({ _id }, {
    $set: {
      categoryNo,
      bookmarkName,
      sortNo,
      isPublic
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.send('error')
  })
})

router.delete('/bookmark/delete', (req, res) => {
  const { _id } = req.body;
  Bookmarks.deleteOne({ _id })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      console.err(err)
      res.send('error')
    })
})

module.exports = router;