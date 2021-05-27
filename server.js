/*const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);


var express = require('express')
var ws = require('ws')
var app = express()
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})
app.listen(3000, function () {
   console.log('Example app listening on port 3000!')
})  
*/
const https = require('https');
const fs = require('fs');
var express = require('express')
var app = express()
// readFileSync function must use __dirname get current directory
// require use ./ refer to current directory.

const options = {
   key: fs.readFileSync(__dirname + '/192.168.3.48-key.pem', 'utf8'),
  cert: fs.readFileSync(__dirname + '/192.168.3.48.pem', 'utf8')
};


 // Create HTTPs server.

 var httpsServer = https.createServer(options, app).listen(8000, function () {
  console.log("server running at https://IP_ADDRESS:8000/")
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({server: httpsServer})
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message)
  })
  setInterval(
    () => ws.send(`${new Date()}`),
    1000
  )
})