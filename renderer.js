// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const {ipcRenderer, shell} = require('electron');
const ftp = require("basic-ftp")
const axios = require("axios"); 
const toastr = require("toastr"); 


const closeApp = document.getElementById('closeApp');
closeApp.addEventListener('click', () => {
    ipcRenderer.send('close-me')
});

const {version, versionCode, versionName} = require('./info.json')
document.getElementById("version").innerHTML = "Version: "+version+ " ("+versionName+")"

async function isOutdated(){
    return new Promise(function (resolve, reject) { 
        axios.get("http://legyonx.ubisuite.com/launcher/info.json")
        .then((res) => {
            if(res.status == 200){
                // console.log(version)
                // console.log(res.data.version);
                if (res.data.versionCode === versionCode) {
                    toastr.success('Versión: '+version, 'Tienes la última versión')
                    resolve({"code":false,"version":version})
                } else {
                    var response = {"code":true,"version":res.data}
                    if((res.data.versionCode - versionCode) == 1){
                        response.previous = true;
                    }else{
                        response.previous = false;
                    }
                    toastr.warning('Versión disponible: '+res.data.version, 'Versión desactualizada')
                    resolve(response)
                } 
            }else{
                toastr.error('No pudimos verificar tu versión: HTTP-'+res.status, 'Error')
                resolve({"code":false,"version":version})
            } 
        })
        .catch((err) => { 
            console.log(err);
            toastr.error('No pudimos verificar tu versión: '+err, 'Error')
            resolve({"code":false,"version":version})
        });
    })
}

updateGame();

async function updateGame(){
    isOutdated().then(async function(result){
        if(result.code){
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
                if(result.previous){
                    await client.downloadToDir(".", "updates/"+result.version.versionCode)
                    document.getElementById("version").innerHTML = "Version: "+result.version.version+ " ("+result.version.versionName+")"
                    toastr.success('Versión: '+result.version.version, 'Actualización correcta')
                }else{
                    for (let i = versionCode + 1; i < result.version.versionCode + 1; i++) {
                        // console.log(i)
                        // console.log(result.version.versionCode)
                        await client.downloadToDir(".", "updates/"+i)
                        if(result.version.versionCode === i) {
                            document.getElementById("version").innerHTML = "Version: "+result.version.version+ " ("+result.version.versionName+")"
                            toastr.success('Versión: '+result.version.version, 'Actualización correcta')
                        }
                      }
                }
            }
            catch(err) {
                console.log(err)
                toastr.error('No pudimos actualizar tu verisón: '+err, 'Error')
            }
            client.close()
            document.getElementById("cover").style.display = "none";
        }
    });
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