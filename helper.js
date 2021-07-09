// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyC4gdo6gFSc_W90EBkoMNieCRqttQZ2zWw",
    authDomain: "test-7f7c0.firebaseapp.com",
    projectId: "test-7f7c0",
    storageBucket: "test-7f7c0.appspot.com",
    databaseURL: "https://test-7f7c0-default-rtdb.asia-southeast1.firebasedatabase.app/",
    messagingSenderId: "531047203297",
    appId: "1:531047203297:web:e005e20157956859bb12a0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var currentUser = {};
DB = firebase.database();

// Initialize WebSocket
var ws = new WebSocket('wss://' + window.location.hostname + ':8000');
ws.onopen = function () {
    console.log('websocket is connected ...');
}

// Process information received from unity
ws.onmessage = function (message) {
    console.log(message);
    // process game result
    if(message.data.slice(0, 7) == "Summary"){
        gameResult = JSON.parse(message.data.slice(8));
        if (currentUser != {} && gameResult.uid == currentUser.uid){
            newScore(gameResult.uid, gameResult.music, gameResult.score,
                gameResult.perfect, gameResult.good, gameResult.missed,
                gameResult.dateAndTimeUTC)
        }
    }
}

function getUTCDateAndTime(){
    // example: 2021-07-03T09:28:49
    var d = new Date();
    return d.getUTCFullYear().toString().padStart(4, '0') + '-' + (d.getUTCMonth()+1).toString().padStart(2, '0') + '-' + d.getUTCDate().toString().padStart(2, '0') + 'T' +
    d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0') + ':' + d.getUTCSeconds().toString().padStart(2, '0');
}

// Register function
function RegisterUser(email, password, confirmPassword){
    if (password != confirmPassword){
        alert("Confirm password does not match.");
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;

            console.log("Successfully registered new user");
            DB.ref('users/'+user.uid).set({
                userEmail: email,
                registerDateAndTimeUTC: getUTCDateAndTime()
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;

            alert(errorMessage);
        });
    }
}

// Login function
function SigninUser(email, password){
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;

            console.log("Successfully signed in");
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;

            alert(errorMessage);
        });
}

// Google signin function
var provider = new firebase.auth.GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
function GoogleSignin(){
    firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
    }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
}

// Logout function
function SignOut(){
    firebase.auth().signOut()
    .then(() => {
        console.log("Succesfully signed out");
    })
    .catch((error) => {
        console.log(error.message);
    });
}

// Change in authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        currentUser = user;

        // update user last signin time
        var d = new Date();
        DB.ref('users/' + user.uid).update({
            lastLoginDateAndTimeUTC: getUTCDateAndTime()
        });

        ws.send("uid:" + user.uid);

        $("#signin-form").addClass("d-none");
        $("#registration-form").addClass("d-none");
        $("#signout-form").removeClass("d-none");

        console.log(user.email + " has signed in");
        // ...
    } else {
        // User is signed out
        // ...
        currentUser = {};
        $("#signin-form").removeClass("d-none");
        $("#registration-form").addClass("d-none");
        $("#signout-form").addClass("d-none");

        console.log("No user signed in")
    }
});


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
                ws.send("gyro:" + event.alpha + " " + event.beta + " " + event.gamma);
            });
        }
    });
}

function newScore(Uid, musicID, Score, Perfect, Good, Missed, DateAndTime){
    console.log("updating database");

    // update for the leaderboard
    DB.ref('game_history/' + musicID).push({
        userID: Uid,
        score: Score,
        spec:{
            perfect: Perfect,
            good: Good,
            missed: Missed,
        },
        dateAndTimeUTC: DateAndTime
    });


}