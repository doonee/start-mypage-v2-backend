var router = require('express').Router();
const { mongoose, startSession } = require('mongoose');
const { Groups } = require('../Model/groupsModel');
const { Categories } = require('../Model/categoriesModel');
const { Bookmarks } = require('../Model/bookmarksModel');

router.post('/group/add', async (req, res, next) => {
  const params = req.body;
  // 프론트에서 넘어온 userId 를 userId 세션? 이나 로컬스토리지? 에서 대조 후 이상 없으면 진행
  // 입력, 수정, 삭제 등 모두 적용 해야함.
  const topRow = await Groups.findOne({}, { _id: -1, groupNo: 1 })
    .sort({ groupNo: -1 }).lean()
  const groupNo = (topRow && topRow.groupNo) ?
    parseInt(topRow.groupNo) + 1 : 1
  const groupTopRow = await Groups.findOne({}, { _id: 1, sortNo: 1 })
    .sort({ sortNo: -1 }).lean()
  const sortNo = (groupTopRow && groupTopRow.sortNo) ?
    parseInt(groupTopRow.sortNo) + 1 : 1
  params.groupNo = groupNo
  params.sortNo = sortNo
  await Groups.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      next(err);
    });
})

router.get('/groups', (req, res, next) => {
  Groups.find().sort({ groupNo: -1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      next(err);
    });
})

router.get('/groups/:userId', (req, res, next) => {
  // userId 는 현재 브라우저의 암호화 된 localStorage userId
  Groups.find({ userId: 'abc' }).sort({ sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

router.get('/group/:id', (req, res, next) => {
  if (req.params && req.params._id === 'newGroup') res.send(null)

  const { id } = req.params;
  Groups.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
    })
})

router.put('/group/edit', (req, res, next) => {
  const { _id, userId, groupName, isImportant, isLineThrough, isPublic, memo } = req.body;
  // 프론트에서 넘어온 userId 를 userId 세션? 이나 로컬스토리지? 에서 대조 후 이상 없으면 진행
  // 입력, 수정, 삭제 등 모두 적용 해야함.
  Groups.findOneAndUpdate({ _id, userId }, {
    $set: {
      _id,
      groupName,
      isImportant,
      isLineThrough,
      isPublic,
      memo
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    next(err)
  })
})

router.put('/group/edit/sort', async (req, res, next) => {
  try {
    const params = req.body;
    const userId = 'abc' // 서버에서 추출
    const queries = []
    params.forEach((item) => {
      queries.push({
        updateOne: {
          filter: { _id: item._id, userId: userId },
          update: { sortNo: item.sortNo },
        },
      });
    });
    Groups.bulkWrite(queries)
    res.send('ok')
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.delete('/group/delete', async (req, res, next) => {
  const { _id } = req.body;
  const session = await startSession();
  try {
    session.startTransaction();
    const topRow = await Groups.findOne({ _id }, { _id: -1, groupNo: 1 }).lean();
    const groupNo = topRow.groupNo;
    await Bookmarks.deleteMany({ groupNo }, { session });
    await Categories.deleteMany({ groupNo }, { session });
    await Groups.deleteOne({ _id }, { session });
    await session.commitTransaction();
    session.endSession();
    res.send('ok');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    next(err)
  }
})

module.exports = router;