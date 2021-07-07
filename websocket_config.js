var ws = new WebSocket('wss://' + window.location.hostname + ':8000');
// event emmited when connected
ws.onopen = function () {
    console.log('websocket is connected ...');
    // window.navigator.vibrate(200);
    // console.log(window.navigator.vibrate);
    // sending a send event to websocket server
    // ws.send('connectedyayyy')
}
// event emmited when receiving message 
ws.onmessage = function (ev) {
    console.log(ev);
}
function getAccel(){
    DeviceMotionEvent.requestPermission().then(response => {
        // document.getElementById("debug").innerHTML = "Hello";
        if (response == 'granted') {
            ws.send('g'); 
            // Add a listener to get smartphone orientation
            // in the alpha-beta-gamma axes (units in degrees)
            window.addEventListener('deviceorientation',(event) => {
                // Expose each orientation angle in a more readable way
                rotation_degrees = event.alpha;
                frontToBack_degrees = event.beta;
                leftToRight_degrees = event.gamma;
                var rd = Math.trunc(rotation_degrees);
                var fd = Math.trunc(frontToBack_degrees);
                var ld = Math.trunc(leftToRight_degrees);
                //ws.send("rd is " + rd.toString() + ", " + "fd is " + fd.toString() + ", " + "ld is " + ld.toString());

                // ws.send('alpha = '+rotation_degrees);
                ws.send(event.alpha + " " + event.beta + " " + event.gamma);
            });
        }
    });
}