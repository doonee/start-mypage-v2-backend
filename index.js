const express = require('express')
const app = express()
var cors = require('cors')
require('dotenv').config()
const port = process.env.REACT_APP_PORT

app.use(cors())

// // post로 보내는 값 받는 옵션
// const { urlencoded } = require('express')
// var bodyParser = require('body-parser')

// post로 보내는 값 받는 옵션
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) // To parse the incoming requests with JSON payloads

// // moment
// const moment = require('moment')
// moment.locale('ko')

// // locals 설정
// app.use((req, res, next) => {
//   // moment : 클라이언트에서 별도의 설정 없이 moment 문법을 그대로 활용할 수 있다. 
//   res.locals.moment = moment
//   next()
// })

// mongoose 모델
const { Board } = require("./Model/boardModel");
const { Users } = require("./Model/usersModel");

// routers
app.get('/', (req, res) => {
  const params = req.query;
  const result = Number(params.num1) + Number(params.num2); // 3
  res.send(String(result))
})

app.get('/users', (req, res) => {
  Users.find().sort({ idx: -1 }) // -1 = desc
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      console.log(err);
      res.send('error')
    });
})

app.get('/board', (req, res) => {
  Board.find().sort({ idx: -1 })
    .then(data => res.send(data))
    .catch((err) => {
      console.error(err);
      res.send('error')
    });
})

app.post('/user/add', async (req, res) => {
  const params = req.body;
  const topRow = await Users.findOne().sort({ idx: -1 })
  const idx = (topRow && topRow.idx) ? parseInt(topRow.idx) + 1 : 1
  await Users.collection.insertOne({
    idx,
    userId: params.userId,
    userPass: params.userPass,
    createdAt: params.createdAt
  })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      console.log(err);
      res.send('error');
    });
})

app.post('/board/add', async (req, res) => {
  const params = req.body;
  const topRow = await Board.findOne().sort({ idx: -1 })
  const idx = (topRow && topRow.idx) ? parseInt(topRow.idx) + 1 : 1
  await Board.collection.insertOne({
    idx,
    title: params.title,
    content: params.content,
    writer: params.writer,
    createdAt: params.createdAt
  }).then(() => {
    res.send('ok')
  }).catch((err) => {
    console.error(err);
    res.send('error');
  });
})

app.get('/board/:id', (req, res) => {
  const { id } = req.params;
  Board.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  Users.findOne({ _id: id })
    .then(data => res.send(data))
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

app.put('/board/edit', (req, res) => {
  const { id, title, content } = req.body;
  Board.findOneAndUpdate({ _id: id }, {
    $set: {
      title,
      content
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.send('error')
  })
})

app.put('/users/edit', (req, res) => {
  const { id, userPass } = req.body;
  Users.findOneAndUpdate({ _id: id }, {
    $set: {
      userPass
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.send('error')
  })
})

app.delete('/board/delete', (req, res) => {
  const { id } = req.body;
  Board.deleteOne({ _id: id })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      console.err(err)
      res.send('error')
    })
})

app.delete('/users/delete', (req, res) => {
  const { id } = req.body;
  Users.deleteOne({ _id: id })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      console.err(err)
      res.send('error')
    })
})

// 404 Not Found : 라우트 가장 아래에 위치
app.all('*', (req, res) => {
  res.status(404).send('Not Found!')
})

// mongoose
if (!process.env.MONGODB_URI) throw new Error('db connection error...')
const mongoose = require('mongoose')
mongoose
  .set('strictQuery', true) // 없으면 경고 발생함!
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connecting MongoDB...");
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });