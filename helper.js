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
var ws = new WebSocket('wss://' + window.location.hostname + ':' + window.location.port);
var ws_connected = false;
ws.onopen = function () {
    console.log('websocket is connected ...');
    ws_connected = true;
    // tell Unity UID of current user
    ws.send("uid:" + currentUser.uid);
    ws.send(window.location.port);
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

ws.onclose = function (message){
    console.log("WebSocket connection lost");
    ws_connected = false;
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

        // tell Unity UID of current user
        if (ws_connected){
            ws.send("uid:" + currentUser.uid);
        }

        // set welcome text
        $("#welcome-text").text("Hi, "+currentUser.email);

        // remove sign in reminders
        $(".signin-reminder").addClass("d-none");

        // get game history
        DB.ref('users/'+currentUser.uid+'/game_history').limitToFirst(10).on('value', snapshot => {
            $("#game-history").html("");
            if (!snapshot.exists()) return;
            snapshot.val().forEach(historyID => {
                // retrieve history detail
                DB.ref('game_history/'+historyID).get().then(historyDetail => {
                    var details = historyDetail.val();
                    var play_time = new Date(details.dateAndTimeUTC + 'Z');
                    var historyCard = '';
                    historyCard += '<div class="card">'
                    historyCard += '    <div class="card-body">'
                    historyCard += '    <h4 class="card-title">'+details.musicID+'</h5>'
                    historyCard += '    <p class="card-text">'
                    historyCard += '        <strong>Score: '+details.score+'</strong><br>'
                    historyCard += '        Perfect: '+details.spec.perfect+' Good: '+details.spec.good+' Miss: ' + details.spec.missed
                    historyCard += '        </p>'
                    historyCard += '    <h6 class="card-subtitle mb-2 text-muted">you played at '+ play_time +'</h6>'
                    // historyCard += '    <a href="#" class="card-link">View music</a>'
                    historyCard += '    </div>'
                    historyCard += '</div>'
                    $("#game-history").append(historyCard);
                })
            });
        })

        DB.ref("songs").get().then((snapshot) => {

            // retrieve a list of playable musics from the server
            $('#listOfMusic').append('<thead>');
            $('#listOfMusic').append('      <tr>');
            $('#listOfMusic').append('        <th scope="col">Title</th>');
            $('#listOfMusic').append('        <th scope="col">Author</th>');
            $('#listOfMusic').append('        <th scope="col">Difficulty</th>');
            $('#listOfMusic').append('        <th scope="col">Select</th>');
            $('#listOfMusic').append('      </tr>');
            $('#listOfMusic').append('    </thead>');
            snapshot.forEach(function(data){
                var val = data.val();
                DB.ref('users/' + val.details.author).child('userEmail').get().then(email => {
                    var content = '';
                    content += '<tr>';
                    content += '<td>' + val.title + '</td>';

                    // retrieve author details
                    content += '<td>' + email.val() + '</td>';
                    content += '<td>' + val.difficulty + '</td>';
                    content += '<td> <button class="btn btn-outline-primary btn-sm" onclick="selectMusic(\'' + val.storageLink.mp3 + '\', \'' + val.storageLink.csv + '\')">select</button></td>';
                
                    content += '</tr>';
                    $('#listOfMusic').append(content);
                })
            })

            // retrieve leaderboard
            snapshot.forEach(function(song){
                var songname = song.key;
                DB.ref("game_history").orderByChild("musicID").equalTo(songname).on('value', snapshot =>{
                    leaderboardList = $('#leaderboard-list');

                    // reset the leaderboard when leaderboard updates
                    leaderboardList.html("");
                    
                    var newcard = '<div class="accordion-item">\
                                        <h2 class="accordion-header" id="' + songname + 'heading">\
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse'+songname+'" aria-expanded="false" aria-controls="collapse'+songname+'">\
                                                '+songname+'\
                                            </button>\
                                        </h2>\
                                        <div id="collapse'+songname+'" class="accordion-collapse collapse" aria-labelledby="' + songname + 'heading" data-bs-parent="#leaderboard-list">\
                                            <div class="accordion-body">';
    
                    console.log(songname);
                    var historyList = Object.values(snapshot.val());
                    console.log(historyList);

                    // sort by score in descending order
                    historyList.sort((a, b) => parseInt(b.score) - parseInt(a.score));

                    // record the userID that has already been displayed on the leaderboard
                    var displayedID=[];

                    // constrains up to how many people can be displayed on the leaderboard
                    var onlyDisplayTopHowMany = 10;
                    for (const historyID in historyList) {
                        console.log(historyList[historyID]);
                        historyDetail = historyList[historyID];

                        // skip if the score belongs to a user that has already been displayed on the leaderboard with a higher score
                        if (displayedID.includes(historyDetail.userID)){
                            continue
                        }else{
                            displayedID.push(historyDetail.userID)
                        }
                        newcard += '        <div class="card">\
                                                <div class="card-body">\
                                                    <h4 class="card-title">'+historyDetail.score+'</h4>\
                                                    <p class="card-text">\
                                                        '+historyDetail.userID+'\
                                                    </p>\
                                                </div>\
                                            </div>';
                        if (displayedID.length >= onlyDisplayTopHowMany){
                            break
                        }
                    }
                    newcard += '</div></div></div>';
                    leaderboardList.append(newcard);
                })
            })

        });

        DB.ref("game")

        $(".auth").addClass("d-none");
        $("#signout-form").removeClass("d-none");

        console.log(user.email + " has signed in");
        // ...
    } else {
        // User is signed out
        // ...
        currentUser = {};

        // sign in reminders
        $(".signin-reminder").removeClass("d-none");

        $(".auth").addClass("d-none");
        $("#openSigninPage").removeClass("d-none");
        $("#openRegistrationPage").removeClass("d-none");

        console.log("No user signed in")
    }
});

function authState(state){
    if ($("#" + state + "-form").hasClass("d-none")){
        $("#signin-form").addClass("d-none");
        $("#registration-form").addClass("d-none");
        $("#" + state + "-form").removeClass("d-none");
    }else{
        $("#signin-form").addClass("d-none");
        $("#registration-form").addClass("d-none");
    }
}

function setSection(sec){
    // sections: instruction, song-list, dashboard, 
    $(".section").addClass("d-none");
    $("#" + sec).removeClass("d-none");

    // change button color
    $(".section-button, .text-secondary").addClass("text-white");
    $(".section-button, .text-secondary").removeClass("text-secondary");
    $("#" + sec +"-button").removeClass("text-white");
    $("#" + sec +"-button").addClass("text-secondary");

    // $(".section-button").addClass("text-white");
    // $("#" + sec +"-button").addClass("text-secondary")
}

function getAccel(){
    var first_time = 1;
    window.addEventListener('deviceorientation',(event) => {
        if (first_time == 1) {
            ws.send('g');
            first_time = 0;
        }
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
        // ws.send('gamma = '+leftToRight_degrees);

    })
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

function selectMusic(mp3URL, csvURL){
    ws.send("musicselected: " + mp3URL + " " + csvURL);
    console.log("musicselected: " + mp3URL + " " + csvURL);
}

function newScore(Uid, MusicID, Score, Perfect, Good, Missed, DateAndTime){
    console.log("updating database");

    // update for the leaderboard
    var refToGameHistory = DB.ref('game_history').push({
        musicID: MusicID,
        userID: Uid,
        score: Score,
        spec:{
            perfect: Perfect,
            good: Good,
            missed: Missed,
        },
        dateAndTimeUTC: DateAndTime
    });

    var historyID = refToGameHistory.key;
    // update past 10 games history
    // get past 10 games, append, then upload
    DB.ref('users/'+Uid).child('game_history').get().then((snapshot) => {
        if (snapshot.exists()){
            var history_log = snapshot.val();
            history_log.unshift(historyID);
            DB.ref('users/'+Uid).update({
                'game_history': history_log
            })
        }else{
            DB.ref('users/'+Uid+'/game_history').set({
                '0': historyID
            })
        }
    });
}

// for test only
function testFunction(){
    // DB.ref('songs/song3').set({
    //     "difficulty": "mid",
    //     "details": {
    //         "author": "pp0r2amgbrfwcmnggM0SBatITRP2",
    //         "creationTime": "2021-07-12T16:21:07"
    //     },
    //     "storageLink":{
    //         "mp3": "https://firebasestorage.googleapis.com/v0/b/test-7f7c0.appspot.com/o/musicFile%2Fsong3.mp3?alt=media&token=05620b7c-5641-401d-b909-779fbaff1ad5",
    //         "csv": "https://firebasestorage.googleapis.com/v0/b/test-7f7c0.appspot.com/o/musicFile%2Fsong3.csv?alt=media&token=04fc65b0-f9bd-48b5-b925-7a1cdeb60947"
    //     }
    // })
    
    // update past 10 games history
    // get past 10 games, append, then upload
    Uid = 'eHWWBuS1xaMDInsEiJehOWXGmoG2';
    var temp = ["Ford", "BMW", "Fiat"];
    console.log(typeof temp);
    temp.pop();
    DB.ref('users/'+Uid).update({
        'game_history': temp
    });
    DB.ref('users/'+Uid).child('game_history').get().then((snapshot) => {
        console.log(snapshot.val());
        console.log(JSON.stringify(snapshot.val()));
    });
}