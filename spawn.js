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

var localizarCameras = function () {

    return new Promise(
        async (resolve, reject) => {
            try {
                var ls = '';
                console.log(process.platform)
                if (process.platform == 'win32') {
                    params = [
                        '-list_devices',
                        'true',
                        '-f',
                        'dshow',
                        '-i',
                        'dummy'
                    ];
                    ls = spawn("ffmpeg", params, {
                        detached: false
                    })
                } else {
                    params = [
                        '--list-devices'
                    ];
                    ls = spawn("v4l2-ctl", params, {
                        detached: false
                    })
                }

                /**
                * events.EventEmitter
                * 1. close
                * 2. disconnect
                * 3. error
                * 4. exit
                * 5. message
                */

                var mensagens = '';
                var cameras = [];
                ls.stdout.on('data', (data) => {
                    console.log(`Mensagens, ${data}`)
                    mensagens = data.toString()
                    //localizar os index de video

                    function getAllIndexes(arr, val) {
                        var indexes = [], i = -1;
                        while ((i = arr.indexOf(val, i + 1)) != -1) {
                            indexes.push(i);
                        }                       
                    }

                    var indexes = getAllIndexes(mensagens, "/dev/video");

                    console.log(indexes)

                    for (let index = 0; index < mensagens.length; index++) {
                        const element = mensagens[index];
                        cameras.push(mensagens.substring(element, element + 12))    
                    }

                    
                })

                ls.stderr.on('data', (erro) => {
                    console.log(`Falha, ${erro}`)
                    cameras = erro;
                })


                ls.on('exit', (code, signal) => {
                    if (code === 1) {
                        console.error(code, signal)
                        reject('Finalizou com erro')
                    } else {
                        resolve(cameras)
                    }
                })
            } catch (error) {
                console.log(error)
            }
        }
    )

};

var capturarImagem = async function () {

    return new Promise(
        async (resolve, reject) => {
            var params = '';
            if (process.platform == 'darwin') {
                params = [
                    '-f',
                    'dshow',
                    '-i',
                    'video=GENERAL - UVC ',
                    '-vframes',
                    '1',
                    `${getDiretorio()}/cam1-${moment().format('DD-MM-YYYY HH:mm:ss')}.jpeg`
                ];
            } else {
                params = [
                    '-f',
                    'video4linux2',
                    '-i',
                    '/dev/video0',
                    '-vframes',
                    '1',
                    `${getDiretorio()}/cam1-${moment().format('DD-MM-YYYY HH:mm:ss')}.jpeg`
                ];
            }

            ls = spawn("ffmpeg", params, {
                detached: false
            })

            ls.on('exit', (code, signal) => {
                if (code === 1) {
                    console.log(signal)
                    console.error('Finalizou com erro')
                } else {

                    console.log(params[6])


                    const path = params[6];

                    fs.access(path, fs.F_OK, (err) => {
                        if (err) {
                            console.error('não encontrou a imagem', err);
                            return;
                        }
                        console.error('encontrou a imagem!');
                        fs.readFile(path, (err, data) => {

                            //error handle
                            if (err) return "Falha ao ler imagem do disco";

                            //convert image file to base64-encoded string
                            let base64Image = new Buffer(data, 'binary').toString('base64');

                            resolve(base64Image);
                        })
                    })
                }
            })
        }
    )
};

module.exports.getAppData = getAppData;
module.exports.getDiretorio = getDiretorio;
module.exports.capturarImagem = capturarImagem;
module.exports.localizarCameras = localizarCameras;
