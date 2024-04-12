const express = require('express')
const multer = require('multer')
const { isTextFile, levenshteinDistance, formatResult, handleNonTextFile } = require('./helpers')
const bodyParser = require('body-parser')
const { Base64 } = require('js-base64')

const app = express()
const upload = multer()

app.set('views', './views')
app.set('view engine', 'pug')
app.use(bodyParser.json())

const HOST = 'localhost'
const PORT = 3000
const getRequest = {
  help: 'Отправьте запрос с данными. Файлы кодируйте в Base64.',
  example:
        {
          text: 'Текстовая строка',
          file1: '0KHQvtC00LXRgNC20LjQvNC+0LUg0L/QtdGA0LLQvtCz0L4g0YTQsNC50LvQsC4=',
          file2: '0KHQvtC00LXRgNC20LjQvNC+0LUg0LLRgtC+0YDQvtCz0L4g0YTQsNC50LvQsC4='
        }
}
const METRIC = 'Расстояние Левенштейна'

app.get('/', (req, res) => {
  if (req.headers.accept.includes('html')) {
    res.render('index')
  } else {
    res.json(getRequest)
  }
})

app.post('/', upload.array('file', 2), (req, res) => {
  const body = req.body

  if (req.headers.accept.includes('html')) {
    for (const file of req.files) {
      if (!isTextFile(file.originalname)) {
        if (req.headers.accept.includes('html')) {
          handleNonTextFile(res)
          return
        }
      }
    }

    const [textFile1, textFile2] = req.files.map(file => file.buffer.toString())

    if (!Base64.isValid(textFile1) || !Base64.isValid(textFile2)) {
      handleNonTextFile(res)
      return
    }

    const [text1, text2] = [textFile1, textFile2].map(textFile => Base64.decode(textFile))


    const result = levenshteinDistance(text1, text2)

    // res.set({
    //   'Content-Type': 'text/plain',
    //   'Content-Disposition': 'attachment; filename="Ответ на запрос.txt"'
    // })
    // res.status(201).send(formatResult(body.text, 'Расстояние Левенштейна', result));

    res.render('index', { result: formatResult(body.text, METRIC, result) })
  } else {
    const body = req.body
    const textFile1 = body.file1
    const textFile2 = body.file2

    if (!Base64.isValid(textFile1) || !Base64.isValid(textFile2)) {
      res.status(400).json({ error: 'Файлы не являются текстовыми' })
      return
    }

    const [text1, text2] = [textFile1, textFile2].map(textFile => Base64.decode(textFile))

    const result = levenshteinDistance(text1, text2)

    res.json({ requestName: body.text, metric: METRIC, result })
  }
})

app.listen(PORT, () => {
  console.log(`App listening on ${HOST}:${PORT}`)
})
