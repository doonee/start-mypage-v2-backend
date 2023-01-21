const express = require('express')
const app = express()
require('dotenv').config()
// const port = process.env.REACT_APP_PORT

// // post로 보내는 값 받는 옵션
// const { urlencoded } = require('express')
// var bodyParser = require('body-parser')

// post로 보내는 값 받는 옵션
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) // To parse the incoming requests with JSON payloads

// moment
const moment = require('moment')
moment.locale('ko')

// locals 설정
app.use((req, res, next) => {
  // moment : 클라이언트에서 별도의 설정 없이 moment 문법을 그대로 활용할 수 있다. 
  res.locals.moment = moment
  next()
})

// mongoose 모델
const { Users } = require("./Model/usersModel");
const { Board } = require("./Model/boardModel");

// routers
app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.get('/users', (req, res) => {
  // Users.find().sort({ idx: -1 }) // -1 = desc
  //   .then((data) => {
  //     res.send(data)
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.send('error')
  //   });
  res.send('/user page')
})

// app.get('/board', (req, res) => {
//   Board.find().sort({ idx: -1 })
//     .then((data) => {
//       res.send(data)
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send('error')
//     });
// })

// app.post('/user/add', async (req, res) => {
//   const params = req.body;
//   const topRow = await Users.findOne().sort({ idx: -1 })
//   let idx = 1;
//   if (topRow && topRow.idx) idx = parseInt(topRow.idx) + 1
//   await Users.collection.insertOne({
//     idx,
//     userId: params.userId,
//     userPass: params.userPass,
//     createdAt: params.createdAt
//   })
//     .then(() => {
//       res.send('ok')
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send('error');
//     });
// })

// app.post('/board/add', async (req, res) => {
//   const params = req.body;
//   const topRow = await Board.findOne().sort({ idx: -1 })
//   let idx = 1;
//   if (topRow && topRow.idx) idx = parseInt(topRow.idx) + 1
//   await Board.collection.insertOne({
//     idx,
//     title: params.title,
//     content: params.content,
//     writer: params.writer,
//     createdAt: params.createdAt
//   }).then(() => {
//     res.send('ok')
//   }).catch((err) => {
//     console.error(err);
//     res.send('error');
//   });
// })

// app.post('/post/add', (req, res) => {
//   let temp = {
//     title: req.body.title,
//     content: req.body.content,
//   };
//   console.log('Counter2 => ', Counter2)
//   Counter2.findOne({ name: "counter2" })
//     .exec()
//     .then((counterInfo) => {
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(400).send("게시글 저장 실패");
//     });
// })

// app.get('/post/:postNum', async (req, res) => {
//   await Post.findOne({ postNum: parseInt(req.params.postNum) }).exec()
//     .then(detail => {
//       // res.locals.moment = moment 설정으로 인해 생략하고 프론트에서 아래와 똑같이 설정 가능
//       // detail.regdate = moment(detail.regdate).format('LLLL') // ex) 2023년 1월 19일 목요일 오전 11:39
//       res.send(detail)
//     })
//     .catch(err => {
//       console.error(err)
//       res.send('error')
//     })
// })

// app.post('/post/edit', (req, res) => {
//   console.log("req.body => ", req.body)
//   const params = req.body;
//   posts.findOneAndUpdate({ _id: parseInt(params._id) }, {
//     $set: {
//       title: params.title,
//       content: params.content
//     }
//   }).then(() => {
//     res.send('ok')
//   }).catch(err => {
//     console.log('catch => ', err)
//   })
// })

// app.delete('/post/delete', (req, res) => {
//   const params = req.body;
//   const postNum = parseInt(params.postNum)
//   if (!postNum || postNum === 0) {
//     console.log(`postNum 부재 => `, postNum)
//     res.send('error');
//   }
//   posts.deleteOne({ _id: postNum })
//     .then(() => {
//       res.send('ok')
//     })
//     .catch((err) => {
//       console.log("🚀 ~ file: index.js:107 ~ app.delete ~ err", err)
//       res.send('error')
//     })
// })

// app.get('/calculator', (req, res) => {
//   const params = req.query;
//   const result = Number(params.num1) + Number(params.num2); // 3
//   res.send(String(result))
// })

// app.post('/calculator', (req, res) => {
//   const params = req.body; // { num1: '899', num2: '454' }
//   const result = Number(params.num1) + Number(params.num2); // 1353
//   res.send(String(result))
// })

// // 404 Not Found : 라우트 가장 아래에 위치
// app.all('*', (req, res) => {
//   res.status(404).send('<h1 style="margin-top: 200px; text-align:center;">Not Found!</h1>')
// })

// // mongoose
// const mongoose = require('mongoose')
// const dbId = encodeURIComponent(process.env.REACT_APP_MONGODB_ID)
// const dbPass = encodeURIComponent(process.env.REACT_APP_MONGODB_PASS)
// const db = encodeURIComponent(process.env.REACT_APP_MONGODB)
// const options = 'retryWrites=true&w=majority'
// const uri = `mongodb+srv://${dbId}:${dbPass}@cluster0.yq1rq.mongodb.net/${db}?${options}`;
// mongoose
//   .set('strictQuery', true) // 없으면 경고 발생함!
//   .connect(uri)
//   .then(() => {
//     console.log("Connecting MongoDB...");
//     app.listen(port, () => {
//       console.log(`Example app listening on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });



app.listen(5000, () => {
  console.log(`Example app listening on port 5000`);
});