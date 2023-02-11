var router = require('express').Router();

const { AppConfig } = require('../Model/appconfigModel');

router.get('/app-config', (req, res) => {
  AppConfig.findOne()
    .then(data => res.send(data))
    .catch((err) => {
      next(err)
    });
})

module.exports = router;