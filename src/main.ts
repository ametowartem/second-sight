import express from 'express';
import multer from 'multer';
import {
  isTextFile,
  levenshteinDistance,
  formatResult,
  handleNonTextFile,
} from './helpers.js';
import bodyParser from 'body-parser';
import { Base64 } from 'js-base64';
import {
  GET_REQUEST,
  HOST,
  METRIC,
  PORT,
  RESULT_FILENAME,
} from './constant/constant.js';
import { FileDistanceJsonRequestDto } from './dto/file-distance.json.request.dto.js';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FileDistanceHtmlRequestDto } from './dto/file-distance.html.request.dto.js';

const app = express();
const upload = multer();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(bodyParser.json());

app.get('/', (req, res) => {
  if (!req.headers.accept.includes('html')) {
    res.json(GET_REQUEST);
  } else {
    res.render('index');
  }
});

app.post('/', upload.array('file', 2), async (req, res) => {
  // я использую html, потому что все браузеры отправляют html в accept,
  // поэтому если его нет то клиент - не браузер
  if (!req.headers.accept.includes('html')) {
    const body = plainToInstance(FileDistanceJsonRequestDto, req.body);
    const errors = await validate(body);

    if (errors.length) {
      res.status(400).json({
        error: `Ошибка валидации: ${errors.map((el: ValidationError) => JSON.stringify(el.constraints))}`,
      });
      return;
    }

    const textFile1 = body.file1;
    const textFile2 = body.file2;

    if (!Base64.isValid(textFile1) || !Base64.isValid(textFile2)) {
      res.status(400).json({ error: 'Файлы не являются текстовыми' });
      return;
    }

    const [text1, text2] = [textFile1, textFile2].map((textFile) =>
      Base64.decode(textFile),
    );

    const result = levenshteinDistance(text1, text2);

    res.json({ requestName: body.text, metric: METRIC, result });
  } else {
    const body = plainToInstance(FileDistanceHtmlRequestDto, req.body);
    const errors = await validate(body);
    const files = req.files as Express.Multer.File[];

    if (errors.length) {
      handleNonTextFile(res, 'Ошибка: неверные входные данные');
      return;
    }

    if (files.length !== 2) {
      handleNonTextFile(res, 'Ошибка: недостаточно файлов');
      return;
    }

    for (let file of files) {
      if (!(await isTextFile(file.buffer, file.mimetype))) {
        handleNonTextFile(res, 'Ошибка: файлы не являются текстовыми');
        return;
      }
    }

    const [textFile1, textFile2] = files.map((file) => file.buffer.toString());

    const result = levenshteinDistance(textFile1, textFile2);

    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${RESULT_FILENAME}"`,
    });

    res
      .status(201)
      .send(formatResult({ text: body.text, metric: METRIC, result: result }));
  }
});

app.listen(PORT, () => {
  console.log(`App listening on ${HOST}:${PORT}`);
});
