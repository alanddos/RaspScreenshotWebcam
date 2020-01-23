var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment')
const { spawn } = require('child_process');


//Func internas
var getAppData = function () {
    return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
}

//func Externas
var getDiretorio = function () {

    let diretorio = path.join(getAppData(), "imagens", moment().format('DD-MM-YYYY'));

    if (!fs.existsSync(diretorio)) {
        mkdirp.sync(diretorio);
    }

    return diretorio
};

var capturarImagem = function () {
    var ls = '';
    if (process.platform == 'darwin') {
        ls = spawn("ffmpeg", [
            '-f',
            'dshow',
            '-i',
            'video=HD Pro Webcam C270',
            '-vframes',
            '1',
            `${getDiretorio()}/cam1${moment().format('DD-MM-YYYY HH:mm:ss')}.jpeg`
        ], {
            detached: false
        })
    } else {
        ls = spawn("ffmpeg", [
            '-f',
            'video4linux2',
            '-i',
            '/dev/video0',
            '-vframes',
            '1',
            `${getDiretorio()}/cam1${moment().format('DD-MM-YYYY HH:mm:ss')}.jpeg`
        ], {
            detached: false
        })
    }

    ls.on('exit', (code, signal) => {
        if (code === 1) {
            console.log(signal)
            console.error('Finalizou com erro')
        } else {
            console.log('Finalizou')

            console.log(ls.ChildProcess.spawnargs[7])

            // const path = iconDir + '\\codificado.txt';

            // fs.access(path, fs.F_OK, (err) => {
            //     if (err) {
            //         console.error('não encontrou a imagem', err);
            //         return;
            //     }
            //     console.error('encontrou a imagem!');
            // })

        }
    })

};

module.exports.getAppData = getAppData;
module.exports.getDiretorio = getDiretorio;
module.exports.capturarImagem = capturarImagem;
