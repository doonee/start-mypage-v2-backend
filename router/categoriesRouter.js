var router = require('express').Router();
const { startSession } = require('mongoose');
const { Categories } = require('../Model/categoriesModel');

router.post('/category/add', async (req, res) => {
  const params = req.body
  // data 옮긴 후 idx 방식으로 자동증가 되게 변경해야 함!
  await Categories.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/categories', (req, res) => {
  Categories.find().sort({ sortNo: 1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/category/:id', (req, res) => {
  const { id } = req.params;
  Categories.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

router.put('/category/edit', (req, res) => {
  const { _id, categoryName, sortNo, isPublic } = req.body;
  Categories.findOneAndUpdate({ _id }, {
    $set: {
      categoryName,
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

router.delete('/category/delete', async (req, res) => {
  const { _id, categoryNo } = req.body;
  const session = await startSession();
  try {
    session.startTransaction();
    await Bookmarks.deleteMany({ categoryNo }, { session });
    await Categories.deleteOne({ _id }, { session });
    await session.commitTransaction();
    session.endSession();
    res.send('ok');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.send('error')
  }
})

module.exports = router;