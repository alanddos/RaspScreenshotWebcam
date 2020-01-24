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
    var params = '';
    if (process.platform == 'darwin') {
	
	params = [
            '-f',
            'dshow',
            '-i',
            'video=HD Pro Webcam C270',
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
            console.log('Finalizou')

            console.log(params[6])


            const path = params[6];

            fs.access(path, fs.F_OK, (err) => {
                 if (err) {
                     console.error('não encontrou a imagem', err);
                     return;
                 }
                console.error('encontrou a imagem!');
		fs.readFile(`${process.cwd()}/pics/demopic.png`, (err, data)=>{
        
        //error handle
        if(err) res.status(500).send(err);
        
        //get image file extension name
        let extensionName = path.extname(`${process.cwd()}/pics/demopic.png`);
        
        //convert image file to base64-encoded string
        let base64Image = new Buffer(data, 'binary').toString('base64');
        
        //combine all strings
        let imgSrcString = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`;
        
        //send image src string into jade compiler
        res.render('index', {imgSrcString});
    })
             })
        }
    })

};

module.exports.getAppData = getAppData;
module.exports.getDiretorio = getDiretorio;
module.exports.capturarImagem = capturarImagem;
