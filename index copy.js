const express = require('express')
const app = express()
const port = 5000
require('dotenv').config()

// post로 보내는 값 받는 옵션
const { urlencoded } = require('express')
var bodyParser = require('body-parser')

const mongoose = require('mongoose')
mongoose.set('strictQuery', true) // 없으면 경고 발생함!

const moment = require('moment')
moment.locale('ko')

// 몽고디비 collections
// var db, counter2, posts, users;
//var db, posts, users;
// 몽구스
const { Post } = require("./Model/post.js");
const { Counter2 } = require("./Model/counter2.js");

// post로 보내는 값 받는 옵션
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());

// locals 설정
app.use((req, res, next) => {
  // moment : 클라이언트에서 별도의 설정 없이 moment 문법을 그대로 활용할 수 있다. 
  res.locals.moment = moment
  next()
})

app.get('/', (req, res) => {
  Post.find()
    .exec()
    .then((postData) => {
      console.log("🚀 ~ file: index.js:38 ~ .then ~ postData", postData)
      res.send(postData)
    })
    .catch((err) => {
      console.log(err);
      res.send(err)
    });
})

app.get('/counter2', (req, res) => {
  Counter2.find()
    // .exec()
    .then((data) => {
      console.log(data)
      res.send(data)
    })
    .catch((err) => {
      console.log(err);
      res.send(err)
    });
})

app.post('/post/add', (req, res) => {
  let temp = {
    title: req.body.title,
    content: req.body.content,
  };
  console.log('Counter2 => ', Counter2)
  Counter2.findOne({ name: "counter2" })
    .exec()
    .then((counterInfo) => {
      console.log("🚀 ~ file: index.js:61 ~ .then ~ counterInfo", counterInfo)
      // temp.postNum = counterInfo.postNum;
      // const NewPost = new Post(temp);
      // NewPost.save().then(() => {
      //   Counter2.findOneAndUpdate(
      //     { name: "counter2" },
      //     {
      //       $inc: { postNum: 1 },
      //     }
      //   )
      //     .exec()
      //     .then(() => {
      //       res.redirect("/");
      //     });
      // });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send("게시글 저장 실패");
    });
  console.log("🚀 ~ file: index.js:89 ~ app.post ~ Counter2", Counter2)
  console.log("🚀 ~ file: index.js:89 ~ app.post ~ Counter2", Counter2)
  console.log("🚀 ~ file: index.js:89 ~ app.post ~ Counter2", Counter2)
})

app.get('/post/:postNum', (req, res) => {
  Post.findOne({ postNum: parseInt(req.params.postNum) })
    .then(detail => {
      // res.locals.moment = moment 설정으로 인해 생략하고 프론트에서 아래와 똑같이 설정 가능
      // detail.regdate = moment(detail.regdate).format('LLLL') // ex) 2023년 1월 19일 목요일 오전 11:39
      res.send(detail)
    })
    .catch(err => {
      console.error(err)
      res.send('error')
    })
})

app.post('/post/edit', (req, res) => {
  console.log("req.body => ", req.body)
  const params = req.body;
  posts.findOneAndUpdate({ _id: parseInt(params._id) }, {
    $set: {
      title: params.title,
      content: params.content
    }
  }).then(() => {
    res.send('ok')
  }).catch(err => {
    console.log('catch => ', err)
  })
})

app.delete('/post/delete', (req, res) => {
  const params = req.body;
  const postNum = parseInt(params.postNum)
  if (!postNum || postNum === 0) {
    console.log(`postNum 부재 => `, postNum)
    res.send('error');
  }
  posts.deleteOne({ _id: postNum })
    .then(() => {
      res.send('ok')
    })
    .catch((err) => {
      console.log("🚀 ~ file: index.js:107 ~ app.delete ~ err", err)
      res.send('error')
    })
})

app.get('/calculator', (req, res) => {
  const params = req.query;
  const result = Number(params.num1) + Number(params.num2); // 3
  //res.send(`계산 결과 => ${result}`)
  res.send(String(result))
})

app.post('/calculator', (req, res) => {
  const params = req.body; // { num1: '899', num2: '454' }
  const result = Number(params.num1) + Number(params.num2); // 1353
  res.send(String(result))
})

// 404 Not Found : 라우트 가장 아래에 위치
app.all('*', (req, res) => {
  res.status(404).send('<h1 style="margin-top: 200px; text-align:center;">Not Found!</h1>')
})

const mdbId = process.env.REACT_APP_MONGODB_ID;
const mdbPass = process.env.REACT_APP_MONGODB_PASS;
const uri = `mongodb+srv://${mdbId}:${mdbPass}@cluster0.yq1rq.mongodb.net/?retryWrites=true&w=majority`;
// const { MongoClient, ServerApiVersion } = require('mongodb-legacy');
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   if (err) {
//     client.close();
//     console.log("🚀 ~ file: index.js:34 ~ err", err)
//     return
//   } else {
//     console.log("MongoDB connected.")
//     app.listen(port, () => {
//       console.log(`app listening on port ${port}`)
//     })
//     db = client.db("Express");
//     counter2 = db.collection("counter2");
//     posts = db.collection("posts");
//     users = db.collection("users");
//   }
// });


// // CONNECT TO MONGODB SERVER
// mongoose
//   //.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .connect(uri)
//   .then(() => console.log('Successfully connected to mongodb'))
//   .catch(e => console.error(e));

// app.listen(port, () => console.log(`Server listening on port ${port}`));



mongoose
  .connect(uri)
  .then(() => {
    console.log("Connecting MongoDB...");
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });