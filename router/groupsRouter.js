var router = require('express').Router();
const { startSession } = require('mongoose');
const { Groups } = require('../Model/groupsModel');
const { Categories } = require('../Model/categoriesModel');
const { Bookmarks } = require('../Model/bookmarksModel');

router.post('/group/add', async (req, res) => {
  const params = req.body;
  const topRow = await Groups
    .findOne(
      {},
      { _id: -1, groupNo: 1 })
    .sort({ groupNo: -1 }).lean()
  const groupNo = (topRow && topRow.groupNo) ? parseInt(topRow.groupNo) + 1 : 1
  const groupTopRow = await Groups
    .findOne(
      {},
      { _id: 1, sortNo: 1 })
    .sort({ sortNo: -1 }).lean()
  const sortNo = (groupTopRow && groupTopRow.sortNo) ? parseInt(groupTopRow.sortNo) + 1 : 1
  params.groupNo = groupNo
  params.sortNo = sortNo
  await Groups.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/groups', (req, res) => {
  Groups.find().sort({ groupNo: -1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/groups/:userId', (req, res) => {
  // userId 는 현재 브라우저의 암호화 된 localStorage userId
  Groups.find({ userId: 'abc' }).sort({ sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/group/:id', (req, res) => {
  const { id } = req.params;
  Groups.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

router.put('/group/edit', (req, res) => {
  const { _id, groupName, isImportant, isLinethrough, isPublic, memo } = req.body;
  Groups.findOneAndUpdate({ _id }, {
    $set: {
      _id,
      groupName,
      isImportant,
      isLinethrough,
      isPublic,
      memo
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.send('error')
  })
})

router.delete('/group/delete', async (req, res) => {
  const { _id, groupNo } = req.body;
  const session = await startSession();
  try {
    session.startTransaction();
    await Bookmarks.deleteMany({ groupNo }, { session });
    await Categories.deleteMany({ groupNo }, { session });
    await Groups.deleteOne({ _id }, { session });
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