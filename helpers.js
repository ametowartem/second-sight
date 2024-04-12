const path = require("path");

exports.isTextFile = function (filename) {
    const textExtensions = ['.txt'];
    const ext = path.extname(filename);
    return textExtensions.includes(ext.toLowerCase());
}

exports.levenshteinDistance = function (text1, text2) {
    const n = text1.length;
    const m = text1.length;

    const matrix = Array.from(Array(n + 1), () => Array.from(m + 1).fill(0));

    for (let i = 0; i <= n; i++) {
        matrix[i][0] = i;
    }

    for (let j = 0; j <= m; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const change = text1[i - 1] === text2[j - 1] ? 0 : 1;

            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + change)
        }
    }

    return matrix[n][m];
}

exports.formatResult = function (text, metric, result) {
    return `Для запроса ${text} сходство (расстояние) ${metric} равно ${result}`
}

exports.handleNonTextFile = function (res) {
    res.status(400).render('index', { error: 'Файлы не являются текстовыми' });
}
