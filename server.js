const https = require('https');
const fs = require('fs');
var express = require('express')
var app = express()
// readFileSync function must use __dirname get current directory
// require use ./ refer to current directory.

const certs = {
   key: fs.readFileSync(__dirname + '/192.168.3.48-key.pem', 'utf8'),
  cert: fs.readFileSync(__dirname + '/192.168.3.48.pem', 'utf8')
};


 // Create HTTPs server.
 var httpsServer = https.createServer(certs, app).listen(8000, function () {
  console.log("server running at https://IP_ADDRESS:8000/")
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

var rd = "0 0 0";
var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({server: httpsServer})
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message);
    rd = message;
  })
  setInterval(
    () => ws.send(`${new Date()}`),
    1000
  )
})

const ws_Unity = require('ws')
const wss_Unity = new ws_Unity.Server({ port: 8080 },()=>{
    console.log('server started')
})
wss_Unity.on('listening',()=>{
   console.log('Unity server listening on 8080')
})
wss_Unity.on('connection', function connection(ws_Unity) {
  setInterval(
    () => {ws_Unity.send(rd); console.log('data sent to Unity: %s', rd);},
    17
  )
})