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

//localizar os index de video
function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

var localizarCameras = function () {

    return new Promise(
        async (resolve, reject) => {
            try {
                /**
                * events.EventEmitter
                * 1. close
                * 2. disconnect
                * 3. error
                * 4. exit
                * 5. message
                */
                var ls = '';
                var result = [];
                console.log(process.platform)
                if (process.platform == 'win32') {//para windows...
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

                    ls.stderr.on('data', (erro) => {
                        console.log(`Falha, ${erro}`)//dshow apresenta como erro os dados :'(
                        cameras = erro;
                    })

                    //DirectShow video devices

                    //DirectShow audio devices

                }

                if (process.platform == 'linux') {
                    params = [
                        '--list-devices'
                    ];
                    ls = spawn("v4l2-ctl", params, {
                        detached: false
                    })

                    var cameras = '';
                    ls.stdout.on('data', (data) => {
                        console.log(`Mensagens, ${data}`)
                        cameras = data.toString()

                        var indexes = getAllIndexes(cameras, "/dev/video");

                        for (let index = 0; index < indexes.length; index++) {
                            const element = indexes[index];
                            let text = cameras.substring(element, element + 12).replace(/(\r\n|\n|\r)/gm, "")//até 99 cameras
                            result.push(text)
                        }
                    })
                }

                ls.on('exit', (code, signal) => {
                    if (code === 1) {
                        console.error(code, signal)
                        reject('Finalizou com erro')
                    } else {
                        resolve(result)
                    }
                })
            } catch (error) {
                console.log(error)
            }
        }
    )


};

var ffmpegs = async function (params) {

    return new Promise(
        async (resolve, reject) => {
            var ls = spawn("ffmpeg", params, {
                detached: false
            })

            ls.on('exit', (code, signal) => {
                if (code === 1) {
                    console.error('Finalizou com erro')
                    reject()
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
            })//exitFfmpeg

        }
    )
}

var capturarImagem = async function () {

    return new Promise(
        async (resolve, reject) => {
            var params = '';
            var imagens = [];
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
            }
            if (process.platform == 'linux') {

                var cameras = await localizarCameras()
                console.log('Cameras encontradas!', cameras)

                for (let index = 0; index < cameras.length; index++) {
                    const video = cameras[index];
                    params = [
                        '-f',
                        'video4linux2',
                        '-i',
                        video,
                        '-vframes',
                        '1',
                        `${getDiretorio()}/${video}-${moment().format('DD-MM-YYYY HH:mm:ss')}.jpeg`
                    ];

                    console.log('parametro enviado', params)

                    ffmpegs(params).then(image => {
                        imagens.push(image)
                    }).catch(()=>{
                        imagens.push(params[3] + ': Não está disponivel para captura')
                    })

                }//endfor
                resolve(imagens)

            }//if Linux
        }
    )
};

module.exports.getAppData = getAppData;
module.exports.getDiretorio = getDiretorio;
module.exports.capturarImagem = capturarImagem;
module.exports.localizarCameras = localizarCameras;
