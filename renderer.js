// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// var AWS = require('aws-sdk');
const ftp = require("basic-ftp")

const {ipcRenderer, shell} = require('electron');
const closeApp = document.getElementById('closeApp');
closeApp.addEventListener('click', () => {
    ipcRenderer.send('close-me')
});

async function updateGame(){
    document.getElementById("cover").style.display = "block";
    const client = new ftp.Client()
    client.ftp.verbose = false
    try {
        await client.access({
            host: "legyonx.ubisuite.com",
            user: "ftpuser",
            password: "mdcftpuser",
            secure: false
        })
        client.trackProgress(info => {
            document.getElementById("file").innerHTML = info.name
            document.getElementById("transferred").innerHTML = info.bytes / 1024 / 1024 + "MB"
            document.getElementById("transferedOverAll").innerHTML = info.bytesOverall / 1024 / 1024 + "MB"
        })
        await client.downloadToDir(".", "files")
        alert('Actualizado correctamente')
    }
    catch(err) {
        console.log(err)
        alert('Error al actualizar:', err)
    }
    client.close()
    document.getElementById("cover").style.display = "none";
}


function openGame() {
    var execFile = require('child_process').execFile, child;

    child = execFile("ygopro.exe",
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
        console.log('Child process exited ' + 'with exit code ' + code);
    });
}

function openUrl(url){
    shell.openExternal(url)
}