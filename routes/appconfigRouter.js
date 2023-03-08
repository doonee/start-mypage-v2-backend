var router = require('express').Router();

const { AppConfig } = require('../schemas/appconfigSchema');

router.get('/app-config', (req, res, next) => {
  AppConfig.findOne()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

module.exports = router;