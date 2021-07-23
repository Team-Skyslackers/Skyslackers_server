// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const https = require('https');
const fs = require('fs');

var QRCode = require('qrcode');
var express = require('express');
var appp = express();
var link1;
var link2;
var qr1;
var qr2;
let mainWindow;
appp.use(express.static(__dirname));
// readFileSync function must use __dirname get current directory
// require use ./ refer to current directory.

var local_IP_address = "";
var interfaces = require("os").networkInterfaces();
for (var k in interfaces) {
  for (var i in interfaces[k]) {
    if (
      interfaces[k][i].family == "IPv4" &&
      interfaces[k][i].address != "127.0.0.1" &&
      !interfaces[k][i].internal
    ) {
      local_IP_address = interfaces[k][i].address;
    }
  }
}

const certs = {
  key: fs.readFileSync(__dirname + "/key.pem", 'utf8'),
  cert: fs.readFileSync(__dirname + "/cert.pem", 'utf8')
};


 // Create HTTPs server.
var httpsServer1 = https.createServer(certs, appp).listen(18000, function () {
  console.log("server running at https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "18000/")
  link1 = "https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "18000/";
  QRCode.toString(link1,{type:'svg'}, function (err, url) {
    // console.log(url);
    qr1 = url;
  })
});

var httpsServer2 = https.createServer(certs, appp).listen(19000, function () {
  console.log("server running at https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "19000/")
  link2 = "https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "19000/";
  QRCode.toString(link2,{type:'svg'}, function (err, url) {
    // console.log(url)
    qr2 = url;
  })
});

appp.get('/', function (req, res) {
  console.log("request received");
  res.sendFile(__dirname + '/index.html');
})

var rd = "0 0 0";

// 
var WebSocketServer = require('ws').Server;
motionControllerServer1 = new WebSocketServer({server: httpsServer1})
var phoneClient1;

const ws = require('ws');
const { allowedNodeEnvironmentFlags } = require('process');

const wsUnityServer1 = new ws.Server({ port: 18080 })
// var unityClient;

var UID1;

motionControllerServer1.on('connection', function (motionController) {
  phoneClient1 = motionController;
  console.log('controller connected');
  motionController.on('message', function (message) {
    // console.log('received: %s', message);
    if (message == 'g') {
      console.log('gyro info received');
      mainWindow.webContents.send('controller1state', 'connected');
    }else if(message.slice(0, 3) == "uid"){
      UID1 = message.split(" ")[0].slice(4);
      console.log(message);
    }else {
      wsUnityServer1.clients.forEach(unity => unity.send(message));
    }
    
  });
  motionController.on('close', function close(){
    console.log('controller disconnected');
    mainWindow.webContents.send('controller1state', 'disconnected')
  });
})

// wsUnityServer.on('listening',()=>{
//    console.log('Unity server listening on 8080')
// })
wsUnityServer1.on('connection', function connection(ws_Unity) {
  // unityClient = ws_Unity;
  ws_Unity.send("UID:" + UID1);
  console.log('Unity connected');
  ws_Unity.on('message', function (message){
    console.log("Unity sent: " + message);
    var client1_connection_count = 0;
    motionControllerServer1.clients.forEach(client => client1_connection_count++);
    if (client1_connection_count == 0){
      phoneClient2.send(message);
    } else {
      phoneClient1.send(message);
    }
  });
  ws_Unity.on('close', function close(){
    console.log("Unity disconnected");
  })
})

motionControllerServer2 = new WebSocketServer({server: httpsServer2})
var phoneClient2;

const wsUnityServer2 = new ws.Server({ port: 18090 })
// var unityClient;

var UID2;

motionControllerServer2.on('connection', function (motionController) {
  phoneClient2 = motionController;
  console.log('controller2 connected');
  var client1_connection_count = 0;
  motionControllerServer1.clients.forEach(client => client1_connection_count++);
  if (client1_connection_count == 0){
    console.log("using controller2 as controller1");
  }

  motionController.on('message', function (message) {
    // console.log('received: %s', message);
    if (message == 'g') {
      console.log('gyro2 info received');
      mainWindow.webContents.send('controller2state', 'connected');
    }else if(message.slice(0, 3) == "uid"){
      UID2 = message.split(" ")[0].slice(4);
      console.log(message);
    }else {
      var client1_connection_count = 0;
      motionControllerServer1.clients.forEach(client => client1_connection_count++);
      if (client1_connection_count == 0){
        wsUnityServer1.clients.forEach(unity => unity.send(message));
      }else{
        wsUnityServer2.clients.forEach(unity => unity.send(message));
      }
    }
    
  });
  motionController.on('close', function close(){
    console.log('controller disconnected');
    mainWindow.webContents.send('controller2state', 'disconnected')
  });
})
// wsUnityServer.on('listening',()=>{
//    console.log('Unity server listening on 8080')
// })
wsUnityServer2.on('connection', function connection(ws_Unity) {
  // unityClient = ws_Unity;
  ws_Unity.send("UID:" + UID2);
  console.log('Unity connected');
  mainWindow.webContents.send('connected', '2');
  ws_Unity.on('message', function (message){
    console.log("Unity sent: " + message);
    phoneClient2.send(message);
  });
  ws_Unity.on('close', function close(){
    console.log("Unity disconnected");
  })
})

//below starts the front-end GUI

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 850,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
      
    }
  })
  // mainWindow.webContents.openDevTools()

  // and load the index.html of the app.
  mainWindow.loadFile('app.html')
  mainWindow.webContents.send('store-data', qr1 + '***' + qr2);
  mainWindow.webContents.send('store-url', link1 + '***' + link2);

  ipcMain.on('qr-request', (event, arg) => {
    console.log("QR requested")
    event.sender.send('qr-request', qr1 + '***' + qr2);
  })

  ipcMain.on('link-request', (event, arg) => {
    console.log("link request")
    event.sender.send('link-request', link1 + '***' + link2);
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// function test(){
//   document.getElementById("QRcode1").innerHTML = qr1;
//   console.log(qr1+'hello');
// }