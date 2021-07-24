// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

var connected1 = false;
var connected2 = false;
const applescript = require('applescript');
var ipcRenderer = require('electron').ipcRenderer;

// request QR from main
ipcRenderer.on('qr-request', function (event, store) {
    console.log("QR response received")
    $("#QRcode1").html(store.split("***")[0].split('<path fill="#ffffff" d="M0 0h37v37H0z"/>').join(""));
    $("#QRcode2").html(store.split("***")[1].split('<path fill="#ffffff" d="M0 0h37v37H0z"/>').join(""));
})
ipcRenderer.send('qr-request')

// request link from main
ipcRenderer.on('link-request', function (event, store) {
    console.log("Link response received")
    $("#URL1").html(store.split("***")[0]);
    $("#URL2").html(store.split("***")[1]);
})
ipcRenderer.send('link-request')

// when user move cursor to QR2
function showQR2(){
    $("#QRcode1").addClass("d-none")
    // $("#URL1").addClass("d-none")
    $("#1stPlayerQRCover").removeClass("d-none")
    $("#QRcode2").removeClass("d-none")
    // $("#URL2").removeClass("d-none")
    $("#2ndPlayerQRCover").addClass("d-none")
}

// when user move cursor away from QR2 
function hideQR2(){
    $("#QRcode1").removeClass("d-none")
    // $("#URL1").removeClass("d-none")
    $("#1stPlayerQRCover").addClass("d-none")
    $("#QRcode2").addClass("d-none")
    // $("#URL2").addClass("d-none")
    $("#2ndPlayerQRCover").removeClass("d-none")
}

// detect controller connection state
var controller1connected = false;
var controller2connected = false;

ipcRenderer.on('controller1state', function (event,store) {
    if (store == "connected"){
        controller1connected = true;
        $("#player1state").html('Player 1 (<strong>connected</strong>)')
        $("#player1card").css('background-color', 'lightgreen')
        showAlert("success", "Player 1 is ready")
    }else if (store == "disconnected"){
        controller1connected = false;
        $("#player1state").html('Player 1 (<strong>disconnected</strong>)')
        $("#player1card").css('background-color', 'red')
        setTimeout(() => {
            $("#player1state").html('Player 1')
            $("#player1card").css('background-color', 'white')
        }, 3000);
        showAlert("error", "Player 1 is disconnected")
    }
    setStartGameButton(controller1connected || controller2connected);
})

ipcRenderer.on('controller2state', function (event,store) {
    if (store == "connected"){
        controller2connected = true;
        $("#player2state").html('Player 2 (<strong>connected</strong>)')
        $("#player2card").css('background-color', 'lightgreen')
        showAlert("success", "Player 2 is ready")
    }else if (store == "disconnected"){
        controller2connected = false;
        $("#player2state").html('Player 2 (<strong>disconnected</strong>)')
        $("#player2card").css('background-color', 'red')
        setTimeout(() => {
            $("#player2state").html('Player 2')
            $("#player2card").css('background-color', 'white')
        }, 3000);
        showAlert("error", "Player 2 is disconnected")
    }
    setStartGameButton(controller1connected || controller2connected);
})

function toggleMultiplayer(){
    if($("#multiplayer-toggle-button").html() == "Multiplayer Mode"){
        $("#multiplayer-toggle-button").html("Single Player Mode")
        $("#player2card").removeClass("d-none")
    }else{
        $("#multiplayer-toggle-button").html("Multiplayer Mode")
        $("#player2card").addClass("d-none")
    }
}

function setStartGameButton(active){
    console.log(active)
    if (active){
        $("#start-game-button").removeAttr('disabled');
        console.log("removed");
    } else {
        $("#start-game-button").attr('disabled', true)
    }
}

function showAlert(type, info){
    // type = success / error
    $("#success_alert").addClass("d-none");
    $("#error_alert").addClass("d-none");

    $("#"+type+"_alert_info").html(info);
    $("#"+type+"_alert").removeClass("d-none");
    setTimeout(() => {
        $("#"+type+"_alert").addClass("d-none");
    }, 3000);

}

function opengame(){

    const script = 'tell application "skyslackers_build" to activate';
    applescript.execString(script);

    // var exec = require('child_process').execFile;
    // var fun =function(){
    //     console.log("opening the game");
    //     exec('skyslackers_build.exe', function(err, data) {  
    //         // console.log(err)
    //         // console.log(data.toString());                       
    //     });  
    // }
    // fun();

}