import { fileTypeFromBuffer } from 'file-type';
import { IFormatResult } from './interface/format-result.interface';
import { Response } from 'express';

export async function isTextFile(buffer: ArrayBuffer, mimeType: string) {
  const fileType = await fileTypeFromBuffer(buffer);
  return mimeType.startsWith('text') || fileType.mime.startsWith('text');
}

export function levenshteinDistance(text1: string, text2: string) {
  const n = text1.length;
  const m = text1.length;

  const matrix = Array.from(Array(n + 1), () => Array(m + 1).fill(0)) as Array<
    Array<number>
  >;

  for (let i = 0; i <= n; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= m; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const change = text1[i - 1] === text2[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + change,
      );
    }
  }

  return matrix[n][m];
}

export function formatResult(dto: IFormatResult) {
  return `Для запроса ${dto.text} сходство (расстояние) ${dto.metric} равно ${dto.result}`;
}

export function handleNonTextFile(res: Response, error: string) {
  res.status(400).render('index', { error: `${error}` });
}
