var router = require('express').Router();
const { startSession } = require('mongoose');
const { Groups } = require('../Model/groupsModel');

router.post('/group/add', async (req, res) => {
  const params = req.body
  // data 옮긴 후 idx 방식으로 자동증가 되게 변경해야 함!
  await Groups.create(params)
    .then(() => {
      res.send('ok')
    }).catch((err) => {
      console.error(err);
      res.send('error');
    });
})

router.get('/groups', (req, res) => {
  Groups.find().sort({ sortNo: 1 })
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
  const { _id, groupName, sortNo, isPublic } = req.body;
  Groups.findOneAndUpdate({ _id }, {
    $set: {
      groupName,
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