const express = require('express')
const app = express()
const port = 5000
require('dotenv').config()
const { urlencoded } = require('express')
var bodyParser = require('body-parser');
const moment = require('moment')
moment.locale('ko')

// 몽고디비 collections
var db, counter, posts, users;

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
  posts
    .find()
    .toArray()
    .then((data) => {
      res.send({
        data,
        msg: 'ok'
      })
    }).catch(err => {
      console.log("🚀 ~ file: index.js:20 ~ app.get ~ err", err)
      res.send({
        data: [],
        msg: 'error'
      })
    })
})

app.get('/postAdd', async (req, res) => {
  try {
    // 변수명을 전역변수와 같은 counter로 하면 에러 발생.
    const cnt = await counter.findOne({ name: 'counter' });
    await posts.insertOne({
      _id: cnt.postNum,
      title: '제목 테스트 입니다. 55',
      content: '내용 테스트 55',
      regdate: new Date(),
    })
    await counter.findOneAndUpdate({
      name: 'counter'
    }, {
      $inc: { postNum: 1 }, // postNum을 1 증가시켜라.
    })
    res.send('ok')
  } catch (error) {
    console.log("🚀 ~ file: index.js:43 ~ app.get ~ error", error)
    res.send('error')
  }
})

app.get('/post/:postNum', (req, res) => {
  posts.findOne({ _id: parseInt(req.params.postNum) })
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
const { MongoClient, ServerApiVersion } = require('mongodb-legacy');
const uri = `mongodb+srv://${mdbId}:${mdbPass}@cluster0.yq1rq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  if (err) {
    client.close();
    console.log("🚀 ~ file: index.js:34 ~ err", err)
    return
  } else {
    console.log("MongoDB connected.")
    app.listen(port, () => {
      console.log(`app listening on port ${port}`)
    })
    db = client.db("Express");
    counter = db.collection("counter");
    posts = db.collection("posts");
    users = db.collection("users");
  }
});