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
      interfaces[k][i].internal == false
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
 var httpsServer = https.createServer(certs, app).listen(8000, function () {
  console.log("server running at https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "8000/")
  QRCode.toString("https://" + local_IP_address.split('.')[0]+ '-'
  + local_IP_address.split('.')[1] + '-' + local_IP_address.split('.')[2] + '-' 
  + local_IP_address.split('.')[3] + ".xip.lhjmmc.cn:" + "8000/",{type:'terminal'}, function (err, url) {
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
motionControllerServer = new WebSocketServer({server: httpsServer})
var phoneClient;

const ws = require('ws');
const { allowedNodeEnvironmentFlags } = require('process');
const wsUnityServer = new ws.Server({ port: 8080 })
// var unityClient;

var UID;

motionControllerServer.on('connection', function (motionController) {
  phoneClient = motionController;
  console.log('controller connected');
  motionController.on('message', function (message) {
    // console.log('received: %s', message);
    if (message == 'g') {
      console.log('gyro info received');
      const script = 'tell application "Skyslackers" to activate';
      applescript.execString(script);
    }else if(message.slice(0, 3) == "uid"){
      UID = message.slice(4);
    }else{
      wsUnityServer.clients.forEach(unity => unity.send(message));
    }
    
  });
  motionController.on('close', function close(){
    console.log('controller disconnected');
  });
})

// wsUnityServer.on('listening',()=>{
//    console.log('Unity server listening on 8080')
// })
wsUnityServer.on('connection', function connection(ws_Unity) {
  // unityClient = ws_Unity;
  ws_Unity.send("UID:" + UID);
  console.log('Unity connected');
  ws_Unity.on('message', function (message){
    console.log("Unity sent: " + message);
    phoneClient.send(message);
  });
  ws_Unity.on('close', function close(){
    console.log("Unity disconnected");
  })
})