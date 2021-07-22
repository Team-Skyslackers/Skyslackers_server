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
ipcRenderer.on('connected', function (event,store) {
    // console.log(store);
    if (store == '1') {
        document.getElementById("st1").innerHTML = "Controller Connected";
        document.getElementById("st1").style.color = "darkgreen";
        document.getElementById("connect1").style.backgroundColor = "#cde2b8";
        connected1 = true;
    }
    else {
        document.getElementById("st2").innerHTML = "Controller Connected";
        document.getElementById("st2").style.color = "darkgreen";
        document.getElementById("connect2").style.backgroundColor = "#cde2b8";
        connected2 = true;
    }

    if (connected1) {
        
        document.getElementById('btn').style.opacity= "1";        
        document.getElementById('btn').style.cursor= "pointer";
        
    }
    else {
        document.getElementById('btn').style.opacity= "0.4";        
        document.getElementById('btn').style.cursor= "not-allowed";
    }
    
    
  });

  ipcRenderer.on('disconnected', function (event,store) {
    console.log(store);
    if (store == '1') {
        document.getElementById("st1").innerHTML = "Controller disconnected";
        document.getElementById("st1").style.color = "rgb(255,0,0)";
        connected1 = false;
        document.getElementById("connect1").style.backgroundColor = "rgb(219, 219, 219)";
    }
    else {
        document.getElementById("st2").innerHTML = "Controller disconnected";
        document.getElementById("st2").style.color = "rgb(255,0,0)";
        connected2 = false;
        document.getElementById("connect2").style.backgroundColor = "rgb(219, 219, 219)";
    }
    
    if (connected1) {
        document.getElementById('btn').style.opacity= "1";        
        document.getElementById('btn').style.cursor= "pointer";
    }
    else {
        document.getElementById('btn').style.opacity= "0.4";        
        document.getElementById('btn').style.cursor= "not-allowed";
    }
    // console.log(store+"hello");
  
  });

  function opengame(){
    if (connected1) {
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
   
  }

  function addplayer() {
    document.getElementById('player2').style.visibility = "visible";  
    document.getElementById('slot').style.visibility = "hidden";  
    
  }
  function deleteplayer() {
    console.log('what');
    document.getElementById('player2').style.visibility = "hidden";  
    // document.getElementsByClassName('hw').style.visibility="hidden";
    document.getElementById('slot').style.visibility = "visible";  
    
  }