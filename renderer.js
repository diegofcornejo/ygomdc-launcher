// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var awsCli = require('aws-cli-js');
var Options = awsCli.Options;
var Aws = awsCli.Aws;
var options = new Options();
var aws = new Aws(options);


const {ipcRenderer} = require('electron');
const closeApp = document.getElementById('closeApp');
closeApp.addEventListener('click', () => {
    ipcRenderer.send('close-me')
});

function downloadGame(){
    aws.command(' s3 sync s3://mdcygopro/game . --no-sign-request', function (err, data) {
        if(err){
            console.log(err)
        }else{
            console.log('data = ', JSON.stringify(data.raw));
            openGame();
        }
    });
}

downloadGame();

function openGame() {
    var execFile = require('child_process').execFile,
        child;

    child = execFile("game/ygopro.exe",
        function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: ' + error.code);
                console.log('Signal received: ' + error.signal);
            }
            console.log('Child Process stdout: ' + stdout);
            console.log('Child Process stderr: ' + stderr);
            ipcRenderer.send('close-me')
        });
    child.on('exit', function (code) {
        console.log('Child process exited ' +
            'with exit code ' + code);
    });
}
