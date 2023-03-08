var router = require('express').Router();

const { Errors } = require('../schemas/errorsSchema');

router.get('/errors/:count', (req, res) => {
  Errors.find().sort({ idx: -1 }).lean().limit(parseInt(req.params.count)).exec()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

module.exports = router;