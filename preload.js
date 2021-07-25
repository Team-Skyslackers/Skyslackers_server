// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
  
// })

// var ipcRenderer = require('electron').ipcRenderer;

// ipcRenderer.on('store-data', function (event,store) {
//   // console.log("QR received")
//   // document.getElementById("QRcode1").innerHTML = "<svg id = \"qr1\" " + store.split("***")[0].slice(4);
//   // document.getElementById("QRcode1").innerHTML = store.split("***")[0];
//   // document.getElementById("QRcode2").innerHTML = store.split("***")[1];
// });
// ipcRenderer.on('store-url', function (event,store) {
//   document.getElementById("URL1").innerHTML = store.split("***")[0];
//   document.getElementById("URL2").innerHTML = store.split("***")[1];
//   // console.log(store+"hello");

// });



{/* <i class="fi-rr-check"></i> */}
{/* <i class="fi-rr-cross-small"></i> */}
