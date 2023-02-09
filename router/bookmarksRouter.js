var router = require('express').Router();
const { startSession } = require('mongoose');
const { Groups } = require('../Model/groupsModel');
const { Categories } = require('../Model/categoriesModel');
const { Bookmarks } = require('../Model/bookmarksModel');

router.post('/bookmark/add', async (req, res) => {
  const params = req.body;
  const topRow = await Bookmarks
    .findOne(
      {},
      { _id: -1, bookmarkNo: 1 })
    .sort({ bookmarkNo: -1 }).lean()
  const bookmarkNo = (topRow && topRow.bookmarkNo) ? parseInt(topRow.bookmarkNo) + 1 : 1
  const bookTopRow = await Bookmarks
    .findOne(
      { categoryNo: parseInt(params.categoryNo) },
      { _id: 1, sortNo: 1 })
    .sort({ sortNo: -1 }).lean()
  const sortNo = (bookTopRow && bookTopRow.sortNo) ? parseInt(bookTopRow.sortNo) + 1 : 1
  params.bookmarkNo = bookmarkNo
  params.sortNo = sortNo
  params.userId = 'abc' // 세션에서...
  await Bookmarks.create(params)
    .then((result) => {
      res.send(result._id);
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/bookmarks', (req, res) => {
  Bookmarks.find().sort({ bookmarkNo: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const regex = (pattern) => new RegExp(`.*${pattern}.*`)
    const keywordRegex = regex(keyword);
    let result = [];
    const groups = await Groups.find({ groupName: { $regex: keywordRegex } })
      .sort({ groupNo: 1 }).lean()
    const categories = await Categories.find({ categoryName: { $regex: keywordRegex } })
      .sort({ groupNo: 1 }).lean()
    const bookmarks = await Bookmarks.find({ bookmarkName: { $regex: keywordRegex } })
      .sort({ groupNo: 1 }).lean()
    await groups.map((g) => result.push(g))
    await categories.map((c) => result.push(c))
    await bookmarks.map((b) => result.push(b))
    res.send(result)
  } catch (err) {
    console.error(err);
    res.send('error')
  }
})

// 개인용
router.get('/my/group/bookmarks/:groupNo', (req, res) => {
  if (!parseInt(req.params?.groupNo)) {
    console.error('groupNo error')
    res.send('error')
  }
  Bookmarks.find({ groupNo: parseInt(req.params.groupNo) })
    .sort({ categoryNo: 1, sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

// 개인용
router.get('/my/category/bookmarks/:categoryNo', (req, res) => {
  if (!parseInt(req.params.categoryNo)) {
    console.error('categoryNo error')
    res.send('error')
  }
  Bookmarks.find({ categoryNo: parseInt(req.params.categoryNo) }).sort({ sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

// 공개용
router.get('/open/group/bookmarks/:groupId', async (req, res) => {
  try {
    const row = await Groups
      .findOne({ _id: req.params.groupId }).lean()
    const GroupNo = (row?.groupNo) ?? null // 대소문자 구별 주의!!
    if (!GroupNo) {
      console.error('존재하지 않는 그룹 아이디 입니다.')
      res.send('error')
    }
    await Bookmarks.find({ GroupNo }).sort({ categoryNo: 1, sortNo: 1 }).lean()
      .then(data => res.send(data))
  } catch (err) {
    console.error(err)
    res.send('error')
  }
})

// 공개용
router.get('/open/category/bookmarks/:categoryId', async (req, res) => {
  try {
    const row = await Categories
      .findOne({ _id: req.params.categoryId }).lean()
    const categoryNo = await (row?.categoryNo) ?? null // 대소문자 구별 주의!!
    if (!categoryNo) {
      console.error('존재하지 않는 카테고리 아이디 입니다.')
      res.send('error')
    }
    await Bookmarks.find({ categoryNo }).sort({ sortNo: 1 }).lean()
      .then(data => res.send(data))
  } catch (err) {
    console.error(err)
    res.send('error')
  }
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
  const { _id, groupNo, categoryNo, bookmarkName, sortNo,
    isImportant, isLineThrough, memo } = req.body;
  Bookmarks.findOneAndUpdate({ _id }, {
    $set: {
      groupNo,
      categoryNo,
      bookmarkName,
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

router.put('/bookmark/edit/sort', async (req, res) => {
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
    Bookmarks.bulkWrite(queries)
    res.send('ok')
  } catch (err) {
    console.log(err)
    res.send('error')
  }
})

// 삭제: 현재 접속자와 북마크 등록자가 같은지 체크 후 삭제하는 로직 구성하기 
// 같은 방식으로 수정, 삭제 모두 수정하기!
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