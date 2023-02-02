var router = require('express').Router();
const { startSession } = require('mongoose');
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

// 개인용
router.get('/my/bookmarks/:categoryNo', (req, res) => {
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
router.get('/open/bookmarks/:categoryId', async (req, res) => {
  try {
    const row = await Categories.findOne({ _id: parseInt(req.params.categoryId) }).lean()
    const CategoryNo = (row && row.categoryNo) ?? null // 대소문자 구별 주의!!
    if (!CategoryNo) {
      console.error('카테고리 번호가 존재하지 않습니다.')
      res.send('error')
    }
    await Bookmarks.find({ CategoryNo }).sort({ sortNo: 1 }).lean()
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