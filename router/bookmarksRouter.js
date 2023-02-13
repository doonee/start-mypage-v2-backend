const axios = require("axios");
const cheerio = require("cheerio");
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
      next(err);
    });
})

// 크롤링으로 웹사이트 정보 가져오기
// 사용자 로그온 상태에서만 가능하게 제한두기!!
router.post('/bookmark/getTitle', async (req, res, next) => {
  if (!req.body || !req.body.uri) return;
  try {
    const html = await axios.post(req.body.uri);
    let title = '';
    if (html?.data) {
      const $ = cheerio.load(html.data);
      title = $("title")?.text() || '';
    }
    res.send(title);
  } catch (error) {
    next(error);
    res.send('');
  }
})

router.get('/bookmarks', (req, res) => {
  Bookmarks.find().sort({ bookmarkNo: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

router.get('/search/:keyword', async (req, res) => {
  try {
    let { keyword } = req.params;
    keyword = decodeURIComponent(keyword)
    const regex = (pattern) => new RegExp(`.*${pattern}.*`)
    const keywordRegex = regex(keyword);
    let result = [];
    const groups = await Groups.find({
      groupName: { $regex: keywordRegex },
      userId: 'abc'
    }).sort({ groupNo: 1 }).lean()
    const categories = await Categories.find({
      categoryName: { $regex: keywordRegex },
      userId: 'abc'
    }).sort({ groupNo: 1 }).lean()
    const bookmarks = await Bookmarks.find({
      bookmarkName: { $regex: keywordRegex },
      userId: 'abc'
    }).sort({ groupNo: 1 }).lean()
    await groups.map((g) => result.push(g))
    await categories.map((c) => result.push(c))
    await bookmarks.map((b) => result.push(b))
    res.send(result)
  } catch (err) {

    next(err)
  }
})

// 개인용
router.get('/my/group/bookmarks/:groupNo', (req, res) => {
  if (!parseInt(req.params?.groupNo)) {
    console.error('groupNo error')
    next(err)
  }
  Bookmarks.find({ groupNo: parseInt(req.params.groupNo) })
    .sort({ categoryNo: 1, sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

// 개인용
router.get('/my/category/bookmarks/:categoryNo', (req, res) => {
  if (!parseInt(req.params.categoryNo)) {
    console.error('categoryNo error')
    next(err)
  }
  Bookmarks.find({ categoryNo: parseInt(req.params.categoryNo) }).sort({ sortNo: 1 }).lean()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

// 공개용
router.get('/open/group/bookmarks/:groupId', async (req, res) => {
  try {
    const row = await Groups
      .findOne({ _id: req.params.groupId, isPublic: true }).lean()
    const GroupNo = (row?.groupNo) ?? null // 대소문자 구별 주의!!
    if (!GroupNo) {
      console.error('그룹이 존재하지 않거나 공개 상태가 아닙니다.')
      next(err)
    }
    await Bookmarks.find({ GroupNo, isPublic: true })
      .sort({ categoryNo: 1, sortNo: 1 }).lean()
      .then(data => res.send(data))
  } catch (err) {
    console.error(err)
    next(err)
  }
})

// 공개용
router.get('/open/category/bookmarks/:categoryId', async (req, res) => {
  try {
    const row = await Categories
      .findOne({ _id: req.params.categoryId, isPublic: true }).lean()
    const categoryNo = await (row?.categoryNo) ?? null // 대소문자 구별 주의!!
    if (!categoryNo) {
      console.error('카테고리가 존재하지 않거나 공개 상태가 아닙니다.')
      next(err)
    }
    await Bookmarks.find({ categoryNo, isPublic: true })
      .sort({ sortNo: 1 }).lean()
      .then(data => res.send(data))
  } catch (err) {
    console.error(err)
    next(err)
  }
})

router.get('/bookmark/:id', (req, res) => {
  const { id } = req.params;
  Bookmarks.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
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
    next(err)
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
    next(err)
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
      next(err)
    })
})

module.exports = router;