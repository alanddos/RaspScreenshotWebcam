var express = require('express');
var app = express();
var spawCommands = require('./spawn')

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/diretorio', function (req, res) {
    res.send(spawCommands.getDiretorio());
});

app.get('/capturar', async function (req, res) {
    let imagem = await spawCommands.capturarImagem()
    res.send(imagem);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});