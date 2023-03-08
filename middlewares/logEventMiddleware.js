const { format } = require('date-fns')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')
const { Errors } = require('../schemas/errorsSchema');

const logSave = async (msg, logName, type) => {
  const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
  const dateTimeHour = format(new Date(), 'yyyyMMdd-HH')
  const logItem = `[${type}]\t${dateTime}\t${msg}\n`
  console.log("\n[logItem] => ", logItem)
  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
    }
    const fileName = `${logName}-${dateTimeHour}.txt`
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', fileName), logItem)
  } catch (err) {
    console.log(err)
  }
}

const logger = (req, res, next) => {
  logSave(`${req.method}\t${req.headers.origin}\t${req.url}`, 'log', 'reqLog')
  console.log(`[logger] => ${req.method} ${req.path}`)
  next()
}

const errorHandler = async (err, req, res, next) => {
  try {
    // [1] 파일로 저장
    logSave(`${err.name}: ${err.message}`, 'log', 'errorLog')

    // [2] DB에 저장
    const data = {}
    const topRow = await Errors.findOne().sort({ idx: -1 })
    const idx = (topRow?.idx) ? parseInt(topRow.idx) + 1 : 1
    data.idx = idx
    if (req?.user?.userId) data.userId = req?.user?.userId // null 허용
    data.fullMessage = err
    await Errors.create(data)

    // [3] 배포 모드에서 에러내용 숨김.
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[errorHandler err.stack] => ${err.stack}`)
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[에러 저장실패]`)
    } else {
      console.log(`[에러 저장실패] ${err}`)
    }
  } finally {
    res?.status(err?.status || 500).send('error')
  }
}

module.exports = { logSave, logger, errorHandler }