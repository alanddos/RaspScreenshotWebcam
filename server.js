var express = require('express');
var app = express();
var spawCommands = require('./spawn')

app.get('/', function (req, res) {
    res.send("RAspberry it's cool!");
});

app.get('/diretorio', function (req, res) {
    res.send(spawCommands.getDiretorio());
});

app.get('/capturar', async function (req, res) {
    let imagem = await spawCommands.capturarImagem()
    res.send(imagem);
});

app.get('/localizarCameras', async function (req, res) {
    let cameras = await spawCommands.localizarCameras()
    res.send(cameras);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});