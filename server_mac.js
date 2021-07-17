const https = require('https');
const fs = require('fs');
const applescript = require('applescript');
var QRCode = require('qrcode');
var express = require('express');
var app = express()

app.use(express.static(__dirname));
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
var httpsServer1 = https.createServer(certs, app).listen(8000, function () {
  console.log("server running at https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "8000/")
  QRCode.toString("https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "8000/",{type:'terminal'}, function (err, url) {
    console.log(url)
  })
});

var httpsServer2 = https.createServer(certs, app).listen(9000, function () {
  console.log("server running at https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "9000/")
  QRCode.toString("https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "9000/",{type:'terminal'}, function (err, url) {
    console.log(url)
  })
});

app.get('/', function (req, res) {
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

const wsUnityServer1 = new ws.Server({ port: 8080 })
// var unityClient;

var UID1;

motionControllerServer1.on('connection', function (motionController) {
  phoneClient1 = motionController;
  console.log('controller connected');
  motionController.on('message', function (message) {
    // console.log('received: %s', message);
    if (message == 'g') {
      console.log('gyro info received');
      const script = 'tell application "Skyslackers" to activate';
      applescript.execString(script);
    }else if(message.slice(0, 3) == "uid"){
      UID1 = message.split(" ")[0].slice(4);
      console.log(message);
    }else if(message.slice(0, 4) == "gyro"){
      wsUnityServer1.clients.forEach(unity => unity.send(message));
    }else {
      console.log(message);
    }
    
  });
  motionController.on('close', function close(){
    console.log('controller disconnected');
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
    phoneClient1.send(message);
  });
  ws_Unity.on('close', function close(){
    console.log("Unity disconnected");
  })
})

motionControllerServer2 = new WebSocketServer({server: httpsServer2})
var phoneClient2;

const wsUnityServer2 = new ws.Server({ port: 8090 })
// var unityClient;

var UID2;

motionControllerServer2.on('connection', function (motionController) {
  phoneClient2 = motionController;
  console.log('controller connected');
  motionController.on('message', function (message) {
    // console.log('received: %s', message);
    if (message == 'g') {
      console.log('gyro info received');
      const script = 'tell application "Skyslackers" to activate';
      applescript.execString(script);
    }else if(message.slice(0, 3) == "uid"){
      UID2 = message.split(" ")[0].slice(4);
      console.log(message);
    }else if(message.slice(0, 4) == "gyro"){
      wsUnityServer2.clients.forEach(unity => unity.send(message));
    }else {
      console.log(message);
    }
    
  });
  motionController.on('close', function close(){
    console.log('controller disconnected');
  });
})

// wsUnityServer.on('listening',()=>{
//    console.log('Unity server listening on 8080')
// })
wsUnityServer2.on('connection', function connection(ws_Unity) {
  // unityClient = ws_Unity;
  ws_Unity.send("UID:" + UID2);
  console.log('Unity connected');
  ws_Unity.on('message', function (message){
    console.log("Unity sent: " + message);
    phoneClient2.send(message);
  });
  ws_Unity.on('close', function close(){
    console.log("Unity disconnected");
  })
})