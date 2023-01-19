const { urlencoded } = require('express')
const express = require('express')
const app = express()
const port = 5000

// 몽고디비 collections
var db, counter, posts, users;

// post로 보내는 값 받는 옵션
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  posts.insertOne({
    title: '제목 테스트 입니다.',
    content: '내용 테스트',
    regdate: new Date(),
  }).then(() => {
    res.send('성공!!')
  }).catch(err => {
    console.log("🚀 ~ file: index.js:20 ~ app.get ~ err", err)
    res.send('실패!! => ' + err)
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

// 특수문자 사용하면 변환해줘야 하는데 변환해도 잘 안됨.
// const pass = '@9*9Y7#9DOvs' 
const pass = 'DnI8GLx620tFrUc9'
const { MongoClient, ServerApiVersion } = require('mongodb-legacy');
const uri = `mongodb+srv://doonee:${pass}@cluster0.yq1rq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  if (err) {
    client.close();
    console.log("🚀 ~ file: index.js:34 ~ err", err)
    return
  } else {
    console.log("MongoDB no error")
    app.listen(port, () => {
      console.log(`app listening on port ${port}`)
    })
    db = client.db("Express");
    counter = db.collection("counter");
    posts = db.collection("posts");
    users = db.collection("users");
  }
});