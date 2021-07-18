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
    ws.send("uid:" + currentUser.uid + ' '+window.location.port);
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
function RegisterUser(username, email, password, confirmPassword){
    if (password != confirmPassword){
        alert("Confirm password does not match.");
        return
    }
    if (username == ""){
        alert("Username cannot be empty.");
        return
    }
    if (username.includes("@")){
        alert("Username cannot be email address.");
        return
    }
    DB.ref('users').orderByChild("username").equalTo(username).get().then(snapshot => {
        if (snapshot.exists()){
            alert("Username already exists.");
            return;
        }else{
            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                var user = userCredential.user;

                console.log("Successfully registered new user");
                DB.ref('users/'+user.uid).set({
                    userEmail: email,
                    username: username,
                    registerDateAndTimeUTC: getUTCDateAndTime()
                });
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                alert(errorMessage);
            });
        }
    })
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

// Send reset password email
function ResetPasswordViaEmail(){
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Password reset email sent!\nPlease check your inbox.");
            // Password reset email sent!
            // ..
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
            // ..
        });
}

// Set user profile
function ProfileSave(newUsername, newPassword, confirmNewPassword){
    // check if anything is chagned at all
    if (newUsername == currentUser.username && newPassword == ""){
        return
    }

    // check format
    if (newUsername == "" || newUsername.includes('@')){
        alert("Please check username format\nCannot be empty or include @")
        return
    }

    // check if passwords match
    if (newPassword != confirmNewPassword){
        alert("Passwords does not match");
        return
    }
    
    // check if username already exists
    if (newUsername != currentUser.username){
        DB.ref('users').orderByChild("username").equalTo(newUsername).get().then(snapshot => {
            if (snapshot.exists()) {
                alert("The username has been taken, please set another username")
            } else {
                DB.ref('users/' + currentUser.uid).update({
                    username: newUsername
                })
                currentUser.username = newUsername
                alert("Username updated!")
            }
        })
    }
    
    // if password not empty then set new password
    if (newPassword != ""){
        firebase.auth().currentUser.updatePassword(newPassword).then(() => {
            alert("Password updated!")
          }).catch((error) => {
            alert(error.message);
          });
    }
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

        // if no username then set default username to its email address
        DB.ref('users/'+user.uid).get().then(snapshot => {
            if (!snapshot.child('username').exists()){
                DB.ref('users/' + user.uid).update({
                    username: snapshot.val().userEmail
                });
                currentUser.username = snapshot.val().userEmail
            }else{
                currentUser.username = snapshot.val().username
            }
            $("#profile-username").val(currentUser.username)
        });

        // tell Unity UID of current user
        if (ws_connected){
            ws.send("uid:" + currentUser.uid);
        }

        // set welcome text
        DB.ref('users/'+currentUser.uid+'/username').get().then(username => {
            $("#welcome-text").text("Hi, "+username.val());
        })

        // remove sign in reminders
        $(".signin-reminder").addClass("d-none");

        // get game history
        DB.ref('users/'+currentUser.uid+'/game_history').limitToFirst(10).on('value', snapshot => {
            if (!snapshot.exists()) return;

            $("#game-history").html("");
            snapshot.val().forEach(historyID => {
                // retrieve history detail
                DB.ref('game_history/'+historyID).get().then(historyDetail => {
                    var details = historyDetail.val();
                    var play_time = new Date(details.dateAndTimeUTC + 'Z');
                    play_time = play_time.toString().split(' ')
                    play_time = play_time[4] + ' ' + play_time[2] + ' ' + play_time[1] + ' ' + play_time[3];
                    var historyCard = '';
                    historyCard += '<div class="card mb-3">'
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
            if (!snapshot.exists()) return;

            $('#listOfMusic').html("");

            // retrieve a list of playable musics from the server
            snapshot.forEach(function(data){
                var val = data.val();
                var songname = data.key;
                DB.ref('users/' + val.details.author).child('username').get().then(username => {
                    var content = '';
                    content += '<div class="card mb-3">'
                    content += '    <div class="card-body">'
                    content += '        <div class="row">'
                    content += '            <h4 class="card-title col">'+val.title+'</h4>'
                    content += '            <h6 class="card-text col">Difficulty: ' + val.difficulty + '</h6>'
                    content += '        </div>'
                    content += '        <div class="row">'
                    content += '            <p class="card-text col-4">By:\n'+username.val()+'</p>'
                    content += '            <div class="col-4">'
                    content += '                <a href="#' + songname + '-detail" class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#' + songname + '-detail" aria-expanded="false" aria-controls="' + val.musicID + '-detail">Detail</a>'
                    content += '            </div>'
                    content += '            <div class="col-4">'
                    content += '                <button class="btn btn-info" onclick="selectMusic(\'' + val.storageLink.mp3 + '\', \'' + val.storageLink.csv + '\')">Play</button>'
                    content += '            </div>'
                    content += '        </div>'
                    content += '        <div class="collapse" id="' + songname + '-detail">'
                    content += '            <hr>'
                    content += '            <h4>Info</h4>'
                    // info about the map
                    var creation_time = new Date(val.details.creationTime + 'Z');
                    creation_time = creation_time.toString().split(' ')
                    creation_time = creation_time[4] + ' ' + creation_time[2] + ' ' + creation_time[1] + ' ' + creation_time[3];
                    content += '            <h6>Creator: '+ username.val() +'</h6>'
                    content += '            <h6>Creation time: '+ creation_time +'</h6>'
                    content += '            <h6 id="'+ songname +'-timesPlayed">Played: many times</h6>' // needs update separately

                    content += '            <h4>Comments</h4>'
                    content += '            <div class="overflow-auto" style="padding: 0px; max-height: 50vh" id="'+songname+'-commentSection">Comments</div>'
                    content += '            <div class="mb-3">'
                    content += '                <label for="' + songname + '-commentinput" class="form-label">New comment</label>'
                    content += '                <input type="text" class="form-control" id="'+songname+'-commentinput">'
                    content += '            </div>'
                    content += '            <button class="btn btn-primary mb-3" onclick="postComment(\''+songname+'\')">Post comment</button>'
                    content += '        </div>'
                    content += '    </div>'
                    content += '</div>'
                    $('#listOfMusic').append(content);

                    // update number of times played
                    DB.ref("game_history").orderByChild("musicID").equalTo(songname).get().then(history =>{
                        if (history.exists()){
                            $("#"+songname+"-timesPlayed").text("Played: "+Object.keys(history.val()).length +" time(s)")
                        }else{
                            $("#"+songname+"-timesPlayed").text("Has not been played yet")
                        }
                    })

                    // update comment section
                    DB.ref('songs/' + songname + "/comments").on('value', comments =>{
                        var allUIDdisplayed = []; // for updating UID with username
                        var commentSection = $("#" + songname + "-commentSection");
                        
                        // empty comment section before each refresh
                        commentSection.html("");

                        // reset if no comment
                        if (!comments.exists()){
                            commentSection.html("no comment yet...")
                            return
                        }

                        // show as cards
                        var commentCard = ""
                        for (const commentID in comments.val()){
                            comment = comments.val()[commentID];
                            allUIDdisplayed.push(comment.userID);
                            var temp_commentCard = '';
                            temp_commentCard += '            <div class="card card-body mb-3">'
                            temp_commentCard += '                <h4 class="card-subtitle ' + comment.userID + '-username">'+comment.userID+'</h4>'
                            temp_commentCard += '                <h6 class="card-text">'+comment.content+'</h6>'

                            var comment_time = new Date(comment.dateAndTimeUTC + 'Z');
                            comment_time = comment_time.toString().split(' ')
                            comment_time = comment_time[4] + ' ' + comment_time[2] + ' ' + comment_time[1] + ' ' + comment_time[3];

                            temp_commentCard += '                <h6 class="card-text text-muted">'+comment_time+'</h6>'
                            temp_commentCard += '            </div>'
                            commentCard = temp_commentCard + commentCard;
                        }

                        commentSection.append(commentCard);

                        // replace UID with username
                        for (const UID in allUIDdisplayed){
                            DB.ref('users/' + allUIDdisplayed[UID] + '/username').get().then(username => {
                                $("." + allUIDdisplayed[UID] + "-username").text(username.val());
                            })
                        }

                    })
                })
            })

            // retrieve leaderboard
            leaderboardList = $('#leaderboard-list');
            leaderboardList.html("");
            snapshot.forEach(function(song){
                var songname = song.val().title;
                var allUIDdisplayed = []; // for updating UID with username
                DB.ref("game_history").orderByChild("musicID").equalTo(songname).get().then(history =>{
                    if (!history.exists()) return;
                    
                    var newcard = '<div class="accordion-item">\
                                        <h2 class="accordion-header" id="' + songname + 'heading">\
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse'+songname+'" aria-expanded="false" aria-controls="collapse'+songname+'">\
                                                '+songname+'\
                                            </button>\
                                        </h2>\
                                        <div id="collapse'+songname+'" class="accordion-collapse collapse" aria-labelledby="' + songname + 'heading" data-bs-parent="#leaderboard-list">\
                                            <div class="accordion-body">';
    
                    var historyList = Object.values(history.val());
                    // console.log(historyList);

                    // sort by score in descending order
                    historyList.sort((a, b) => parseInt(b.score) - parseInt(a.score));

                    // record the userID that has already been displayed on the leaderboard
                    var displayedID=[];

                    // constrains up to how many people can be displayed on the leaderboard
                    var onlyDisplayTopHowMany = 10;
                    for (const historyID in historyList) {
                        // console.log(historyList[historyID]);
                        historyDetail = historyList[historyID];
                        var play_time = new Date(historyDetail.dateAndTimeUTC + 'Z');
                        play_time = play_time.toString().split(' ')
                        play_time = play_time[4] + ' ' + play_time[2] + ' ' + play_time[1] + ' ' + play_time[3];

                        // skip if the score belongs to a user that has already been displayed on the leaderboard with a higher score
                        if (displayedID.includes(historyDetail.userID)){
                            continue
                        }else{
                            displayedID.push(historyDetail.userID)
                            allUIDdisplayed.push(historyDetail.userID)
                        }
                        
                        newcard += '        <div class="card">\
                                                <div class="card-body">\
                                                    <h4 class="card-title ' + historyDetail.userID + '-username">'+historyDetail.userID+'</h4>\
                                                    <h6 class="card-text">score: '+historyDetail.score+'</h6>\
                                                    <p class="text-muted">played at '+ play_time +'</p>\
                                                </div>\
                                            </div>';
                        if (displayedID.length >= onlyDisplayTopHowMany){
                            break
                        }
                    }
                    newcard += '</div></div></div>';
                    leaderboardList.append(newcard);

                    // replace UID with username
                    for (const UID in allUIDdisplayed){
                        DB.ref('users/' + allUIDdisplayed[UID] + '/username').get().then(username => {
                            $("." + allUIDdisplayed[UID] + "-username").text(username.val());
                        })
                    }
                })
            })
        });

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

function postComment(musicID){
    var comment = $("#"+musicID+"-commentinput").val();
    DB.ref("songs/" + musicID + "/comments").push({
        dateAndTimeUTC: getUTCDateAndTime(),
        content: comment,
        userID: currentUser.uid
    });
    $("#"+musicID+"-commentinput").val("");
    alert("comment posted!")
}

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
}