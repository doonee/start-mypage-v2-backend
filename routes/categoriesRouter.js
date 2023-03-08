var router = require('express').Router();
const { startSession } = require('mongoose');
const { Groups } = require('../schemas/groupsSchema');
const { Categories } = require('../schemas/categoriesSchema');
const { Bookmarks } = require('../schemas/bookmarksSchema');

router.post('/category/add', async (req, res, next) => {
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
      next(err);
    });
})

router.get('/categories', (req, res, next) => {
  Categories.find().sort({ categoryNo: -1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

// 개인용
router.get('/my/group/categories/:groupNo', (req, res, next) => {
  if (!req.params || !req.params.groupNo) {
    console.error('그룹번호가 올바르지 않습니다.')
    next(err)
  }
  Categories.find({ groupNo: req.params.groupNo }).sort({ sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

// 공개용
router.get('/open/categories/:groupId', async (req, res, next) => {
  try {
    const row = await Groups.findOne({ _id: req.params.groupId }).lean()
    const groupNo = (row && row.groupNo) ? row.groupNo : null
    if (!groupNo) {
      console.error('그룹번호가 존재하지 않습니다.')
      next(err)
    }
    await Categories.find({ groupNo }).sort({ sortNo: 1 }).lean()
      .then(data => res.send(data))
  } catch (err) {
    console.error(err)
    next(err)
  }
})

router.get('/categories/:userId', (req, res, next) => {
  Categories.find({ userId: req.params.userId }).sort({ sortNo: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

router.get('/category/:_id', (req, res, next) => {
  const { _id } = req.params;
  Categories.findOne({ _id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
    })
})

router.put('/category/edit', (req, res, next) => {
  const { _id, groupNo, categoryName, sortNo, isImportant,
    isLineThrough, isPublic, memo } = req.body;
  Categories.findOneAndUpdate({ _id }, {
    $set: {
      groupNo,
      categoryName,
      sortNo,
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

router.put('/category/edit/sort', async (req, res, next) => {
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
    next(err)
  }
})

router.delete('/category/delete', async (req, res, next) => {
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

    next(err)
  }
})

module.exports = router;