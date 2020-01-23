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
var getDiretorios = function () {

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
            'test.jpeg'
        ], {
            detached: false
        })
    } else {
        ls = ls = spawn("ffmpeg", [
            '-f',
            'video4linux2',
            '-i',
            '/dev/video0',
            '-vframes',
            '1',
            'test.jpeg'
        ], {
            detached: false
        })
    }

    console.log(ls)

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code == 0) {
            // fs.unlink(iconDir + '\\codificado.txt', function (err) {
            //     if (err) throw err;
            //     // if no error, file has been deleted successfully
            //     console.log('File deleted!');
            // });
        }
    });

};

module.exports.getAppData = getAppData;
module.exports.getDiretorios = getDiretorios;
module.exports.capturarImagem = capturarImagem;
