var router = require('express').Router();
const { startSession } = require('mongoose');
// const { Groups } = require('../Model/groupsModel');
const { Categories } = require('../Model/categoriesModel');
const { Bookmarks } = require('../Model/bookmarksModel');

router.post('/category/add', async (req, res) => {
  const params = req.body;
  const topRow = await Categories
    .findOne(
      {},
      { _id: -1, categoryNo: 1 })
    .sort({ categoryNo: -1 }).lean()
  const categoryNo = (topRow && topRow.categoryNo) ? parseInt(topRow.categoryNo) + 1 : 1
  const cateTopRow = await Categories
    .findOne(
      { groupNo: parseInt(params.groupNo) },
      { _id: 1, sortNo: 1 })
    .sort({ sortNo: -1 }).lean()
  const sortNo = (cateTopRow && cateTopRow.sortNo) ? parseInt(cateTopRow.sortNo) + 1 : 1
  params.categoryNo = categoryNo
  params.sortNo = sortNo
  await Categories.create(params)
    .then((result) => {
      res.send(result._id);
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/categories', (req, res) => {
  Categories.find().sort({ categoryNo: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/categories/:userId', (req, res) => {
  Categories.find({ userId: req.params.userId }).sort({ sortNo: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/category/:_id', (req, res) => {
  const { _id } = req.params;
  Categories.findOne({ _id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

router.put('/category/edit', (req, res) => {
  const { categoryId, groupNo, categoryName, sortNo, isImportant, isLinethrough, memo } = req.body;
  Categories.findOneAndUpdate({ _id: categoryId }, {
    $set: {
      groupNo,
      categoryName,
      sortNo,
      isImportant,
      isLinethrough,
      memo
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.send('error')
  })
})

router.delete('/category/delete', async (req, res) => {
  const { _id } = req.body;
  const session = await startSession();
  try {
    session.startTransaction();
    const { categoryNo } = await Categories.findOne({ _id }, { _id: -1, categoryNo: 1 }).lean()
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