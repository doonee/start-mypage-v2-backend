const { Configs } = require('../schemas/ConfigsSchema');

const getMyConfigs = (req, res, next) => {
  //const { userId } = req.params;
  const userId = req.user;
  console.log("🚀 ~ file: configsRouter.js:29 ~ router.get ~ userId:", userId)
  Configs.findOne({ userId })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      next(err)
    })
}

module.exports = { getMyConfigs }