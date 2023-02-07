var router = require('express').Router();
const { startSession } = require('mongoose');
const { Groups } = require('../Model/groupsModel');
const { Categories } = require('../Model/categoriesModel');
const { Bookmarks } = require('../Model/bookmarksModel');

router.post('/category/add', async (req, res) => {
  const params = req.body;
  // 프론트에서 넘어온 userId 를 userId 세션? 이나 로컬스토리지? 에서 대조 후 이상 없으면 진행
  // 입력, 수정, 삭제 등 모두 적용 해야함.
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
  Categories.find().sort({ categoryNo: -1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

// 개인용
router.get('/my/group/categories/:groupNo', (req, res) => {
  if (!req.params || !req.params.groupNo) {
    console.error('그룹번호가 올바르지 않습니다.')
    res.send('error')
  }
  Categories.find({ groupNo: req.params.groupNo }).sort({ sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err)
      res.send('error')
    });
})

// 공개용
router.get('/open/categories/:groupId', async (req, res) => {
  try {
    const row = await Groups.findOne({ _id: req.params.groupId }).lean()
    const groupNo = (row && row.groupNo) ? row.groupNo : null
    if (!groupNo) {
      console.error('그룹번호가 존재하지 않습니다.')
      res.send('error')
    }
    await Categories.find({ groupNo }).sort({ sortNo: 1 }).lean()
      .then(data => res.send(data))
  } catch (err) {
    console.error(err)
    res.send('error')
  }
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
  const { _id, groupNo, categoryName, sortNo, isImportant, isLineThrough, memo } = req.body;
  Categories.findOneAndUpdate({ _id }, {
    $set: {
      groupNo,
      categoryName,
      sortNo,
      isImportant,
      isLineThrough,
      memo
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.send('error')
  })
})

router.put('/category/edit/sort', async (req, res) => {
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
    Categories.bulkWrite(queries)
    res.send('ok')
  } catch (err) {
    console.log(err)
    res.send('error')
  }
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