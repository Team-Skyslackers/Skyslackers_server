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
    if (username.length<3 || username.includes('@') || username.includes(' ')){
        alert("Invalid username.");
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
        console.log("Successfully log in with google");
        //detect if registered before
        DB.ref('users/'+user.uid+'/registerDateAndTimeUTC').get().then(snapshot => {
            if(!snapshot.exists()){
                // new user
                DB.ref('users/'+user.uid).update({
                    userEmail: user.email,
                    username: user.email,
                    registerDateAndTimeUTC: getUTCDateAndTime()
                });
            }
        })
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
    // check format
    if (newUsername.length < 3 || newUsername.includes('@') || newUsername.includes(' ')){
        alert("Invalid username")
        return
    }

    // check if anything is chagned at all
    if (newUsername == currentUser.username && newPassword == ""){
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
                location.reload();
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

        // empty sign in forms
        $("input").val("");

        // if no username then set default username to its uid
        DB.ref('users/'+user.uid + '/username').get().then(snapshot => {
            if (!snapshot.exists()){
                DB.ref('users/' + user.uid + '/username').set(user.uid);
                currentUser.username = user.uid
            }else{
                currentUser.username = snapshot.val()
            }
            $("#profile-username").val(currentUser.username)

            // set welcome text
            $("#welcome-text").text("Hi, "+currentUser.username);
        });

        // tell Unity UID of current user
        if (ws_connected){
            ws.send("uid:" + currentUser.uid);
        }

        // remove sign in reminders
        $(".signin-reminder").addClass("d-none");

        // get friends list
        getFriendsList()
        
        // get game history
        getHistoryList()

        // get map list
        getMaps();

        // get notification for new maps, get leaderboard
        getLeaderboard();

        $(".auth").addClass("d-none");
        $("#signout-form").removeClass("d-none");
        $("#profile-page").removeClass("d-none");

        console.log(user.email + " has signed in");
        // ...
    } else {
        // User is signed out
        // ...
        currentUser = {};

        // sign in reminders
        $(".signin-reminder").removeClass("d-none");

        // reset contents
        $('#mapSearchBar').html("");
        $('#listOfMusic').html("");
        $('#leaderboard-list').html("");
        $("#new-maps-notification").html("");
        $("#game-history").html("");
        $("#profile-username").val("");
        $("#profile-newpassword").val("");
        $("#profile-confirmpassword").val("");
        $("#listOfFriends").html("");



        $(".auth").addClass("d-none");
        $("#openSigninPage").removeClass("d-none");
        $("#openRegistrationPage").removeClass("d-none");
        $("#profile-page").addClass("d-none");

        console.log("No user signed in")
    }
});

function getLeaderboard(){
    DB.ref("songs").get().then((snapshot) => {
        if (!snapshot.exists()) return;

        snapshot.forEach(function(data){
            var val = data.val();
            var songname = data.key;

            // update dashboard - new maps
            DB.ref('users/' + currentUser.uid + '/NewMapNotification/' + songname).get().then(notification_state => {
                if (!notification_state.exists()){
                    var creation_time = new Date(val.details.creationTime + 'Z');
                    var diff = Math.abs(new Date() - creation_time) / (1000*60*60*24); // in days
                    if (diff <= 7){ // uploaded within 7 days
                        // add to recent uploads
                        var temp = "";
                        temp += '\
                        <div class="card bg-gradient mb-3" id="'+songname.split(' ').join('_')+'-new-map-notification" style="background-color: LightSkyBlue">\
                            <div class="card-body row">\
                            <div class="col-8">\
                               <h4 class="card-title">New map!</h4>\
                               <h6 class="card-text"><strong>'+songname+'</strong></h6>\
                               <h6 class="card-text">Published '+Math.floor(diff)+' day(s) ago</h6>\
                            </div>\
                            <div class="col-4">\
                                <button class="btn btn-outline-secondary"\
                                    style="width: 100%"\
                                    onclick="\
                                        $(\'#'+songname.split(' ').join('_')+'-new-map-notification\').fadeOut(); \
                                        dismissNewMapNotification(\''+songname+'\');\
                                    "\>\
                                    dismiss\
                                </button>\
                            </div>\
                            </div>\
                        </div>'
                        $("#new-maps-notification").append(temp);
                    }
                }
            })
        })

        // retrieve leaderboard
        leaderboardList = $('#leaderboard-list');
        leaderboardList.html("");
        snapshot.forEach(function(song){
            var songname = song.key;
            var allUIDdisplayed = []; // for updating UID with username
            DB.ref("game_history").orderByChild("musicID").equalTo(songname).get().then(history =>{
                if (!history.exists()) return;

                // sort by score in descending order
                var historyList = Object.values(history.val());
                historyList.sort((a, b) => parseInt(b.score) - parseInt(a.score));
                
                var newcard = '<div class="accordion-item">\
                                    <h2 class="accordion-header" id="' + songname.split(' ').join('_') + 'heading">\
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse'+songname.split(' ').join('_')+'" aria-expanded="false" aria-controls="collapse'+songname.split(' ').join('_')+'">\
                                            <strong>'+songname+'</strong>\
                                        </button>\
                                    </h2>\
                                    <div id="collapse'+songname.split(' ').join('_')+'" class="accordion-collapse collapse" aria-labelledby="' + songname.split(' ').join('_') + 'heading" data-bs-parent="#leaderboard-list">\
                                        <div class="accordion-body">';

                // console.log(historyList);

                // record the userID that has already been displayed on the leaderboard
                var displayedID=[];

                // record current rank
                var leaderboard_rank = 1;

                // constrains up to how many people can be displayed on the leaderboard
                var onlyDisplayTopHowMany = 10;
                for (const historyID in historyList) {
                    // console.log(historyList[historyID]);
                    historyDetail = historyList[historyID];
                    var play_time = new Date(historyDetail.dateAndTimeUTC + 'Z');
                    play_time = play_time.toString().split(' ')
                    play_time = play_time[2] + ' ' + play_time[1] + ' ' + play_time[3] + ' ' + play_time[4];

                    // skip if the score belongs to a user that has already been displayed on the leaderboard with a higher score
                    if (displayedID.includes(historyDetail.userID)){
                        continue
                    }else{
                        displayedID.push(historyDetail.userID)
                        allUIDdisplayed.push(historyDetail.userID)
                    }
                    
                    if (historyDetail.userID == currentUser.uid){
                        newcard += '        <div class="card mb-3 bg-gradient" style="background-color: AliceBlue">'
                    }else{
                        newcard += '        <div class="card mb-3 bg-light">'
                    }
                    newcard += '            <div class="card-body">\
                                                <div class="row">'
                    
                    if (leaderboard_rank == 1){ // add gold star for No.1 user
                    newcard += '                    <h4 class="col-4 card-title">No.'+leaderboard_rank+'<span style="color:Gold">&#9733;</span></h4>'
                    newcard += '                    <h4 class="col-8 card-title ' + historyDetail.userID + '-username" style="color: Goldenrod; text-align: right">'+historyDetail.userID+'</h4>'
                    $("#" + songname.split(' ').join('_') + '_' + historyDetail.userID + '_score').css("color", "Goldenrod")
                    }else{
                    newcard += '                    <h4 class="col-4 card-title">No.'+leaderboard_rank+'</h4>'
                    newcard += '                    <h4 class="col-8 card-title ' + historyDetail.userID + '-username" style="text-align: right">'+historyDetail.userID+'</h4>'
                    }
                    newcard += '                </div>\
                                                <h6 class="card-text">score: '+historyDetail.score+'</h6>\
                                                <p class="text-muted">played at '+ play_time +'</p>\
                                            </div>\
                                        </div>';
                    if (displayedID.length >= onlyDisplayTopHowMany){
                        break
                    }
                    leaderboard_rank++;
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
}

function resetSearchBar(){
    $('#searchMapKeywords').val("")
    $('#selectMapDifficulty').val("")
}

function getMaps(Search = "", Difficulty = ""){
    DB.ref("songs").get().then((snapshot) => {
        if (!snapshot.exists()) return;

        if ($('#mapSearchBar').html() == ""){
            $('#mapSearchBar').html('\
            <div class="input-group mb-3">\
                <input type="text" id="searchMapKeywords" class="form-control" placeholder="Keyword" aria-label="Search">\
                <select class="form-select" id="selectMapDifficulty" aria-label="Select difficulty" style="max-width: fit-content;">\
                    <option selected value="">All</option>\
                    <option value="easy">Easy</option>\
                    <option value="normal">Normal</option>\
                    <option value="hard">Hard</option>\
                </select>\
                <button class="btn btn-outline-secondary" type="button" onclick="getMaps($(\'#searchMapKeywords\').val(), $(\'#selectMapDifficulty\').val())">Search</button>\
            </div>');
        }

        $("#listOfMusic").html("");
        if (Search != "" || Difficulty != ""){
            $("#listOfMusic").html('\
            <div class="container" style="text-align: center">\
                <button class="btn btn-outline-primary mb-3" style="width: 80%; padding: 6px" onclick="resetSearchBar(); getMaps()">Clear search results</button>\
            <div');
        }
        snapshot.forEach(function(data){
            var val = data.val();
            var songname = data.key;

            // filter by difficulty
            if (Difficulty != "" && Difficulty != val.difficulty) return;

            // update list of maps
            DB.ref('users/' + val.details.author).child('username').get().then(username => {

                // filter by keyword
                // discard if both song title and username does not include the keyword
                if (!songname.toLowerCase().includes(Search.toLowerCase()) && !username.val().toLowerCase().includes(Search.toLowerCase())) return;
                
                var content = '';
                content += '\
                <div class="card bg-light bg-gradient mb-3">\
                    <div class="card-body">\
                        <div class="row">\
                            <h4 class="card-title col">'+songname+'</h4>\
                            <h6 class="card-text col" style="text-align: right">Difficulty: ' + val.difficulty + '</h6>\
                        </div>\
                        <div class="row">\
                            <div class="col-8">\
                                <p class="card-text">By:\n'+username.val()+'</p>\
                            </div>\
                            <div class="col-4">\
                                <a href="#' + songname.split(' ').join('_') + '_detail" class="btn btn-outline-primary collapsed" data-bs-toggle="collapse" aria-expanded="false" aria-controls="' + songname.split(' ').join('_') + '_detail" style="width: 100%;">Detail</a>\
                            </div>\
                        </div>\
                        <div style="text-align:center; margin-top: 6px;">'
                // if have link then get button, otherwise no button
                if (Object.keys(val).includes("storageLink")){
                    content += '            <button class="btn" style="left: 50%; width: 80%; padding: 6px; background-color: SkyBlue;" onclick="selectMusic(\'' + val.storageLink.mp3 + '\', \'' + val.storageLink.csv + '\'); setSection(\'instruction-section\')">Start Game</button>'
                }else{
                    content += '            <p style="padding-top: 16px;">Please select in game</p>'
                }
                content += '\
                        </div>\
                        <div class="collapse" id="' + songname.split(' ').join('_') + '_detail">\
                            <hr>'
                var creation_time = new Date(val.details.creationTime + 'Z');
                creation_time = creation_time.toString().split(' ')
                creation_time = creation_time[2] + ' ' + creation_time[1] + ' ' + creation_time[3] + ' ' + creation_time[4];
                content += '\
                            <h6>Creator: '+ username.val() +'</h6>\
                            <h6>Creation time: '+ creation_time +'</h6>\
                            <h6 id="'+ songname.split(' ').join('_') +'_timesPlayed">Played: many times</h6>\
                            <div id="'+songname.split(' ').join('_')+'_highest_score" style="margin: 0px"></div>\
                            <hr>\
                            <h4>Comments</h4>\
                            <div class="overflow-auto mb-3" style="padding: 0px; max-height: 50vh" id="'+songname.split(' ').join('_')+'-commentSection">Comments</div>\
                                <div class="input-group mb-3">\
                                    <input type="text" class="form-control" placeholder="New comment..." id="'+songname.split(' ').join('_')+'-commentinput">\
                                    <button class="btn btn-secondary" onclick="postComment(\''+songname+'\')">Post comment</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>'
                $('#listOfMusic').append(content);

                // update number of times played
                DB.ref("game_history").orderByChild("musicID").equalTo(songname).get().then(history =>{
                    if (history.exists()){
                        $("#"+songname.split(' ').join('_')+"_timesPlayed").text("Played: "+Object.keys(history.val()).length +" time(s)")
                        
                        // sort history list
                        var historyList = Object.values(history.val());
                        historyList.sort((a, b) => parseInt(b.score) - parseInt(a.score));
                        DB.ref("users").child(historyList[0].userID).get().then(user => {
                            $("#"+songname.split(' ').join('_')+"_highest_score").html('\
                            <h6>Highest score: <span style="color: DarkBlue">'+historyList[0].score+'</span> by <span style="color: DarkBlue">'+user.val().username+'</span></h6>\
                            ')
                        })
                    }else{
                        $("#"+songname.split(' ').join('_')+"_timesPlayed").text("Has not been played yet")
                    }
                })

                // update comment section
                DB.ref('songs/' + songname + "/comments").on('value', comments =>{
                    var allUIDdisplayed = []; // for updating UID with username
                    var commentSection = $("#" + songname.split(' ').join('_') + "-commentSection");
                    
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
                        var comment_time = new Date(comment.dateAndTimeUTC + 'Z');
                        comment_time = comment_time.toString().split(' ')
                        comment_time = comment_time[2] + ' ' + comment_time[1] + ' ' + comment_time[3] + ' ' + comment_time[4];
                        allUIDdisplayed.push(comment.userID);
                        var temp_commentCard = '';
                        
                        //highlight comment if comment belongs to the user
                        if (comment.userID = currentUser.uid){
                            temp_commentCard += '            <div class="card bg-gradient card-body mb-3" style="background-color: AliceBlue">'
                        }else{
                            temp_commentCard += '            <div class="card bg-light bg-gradient card-body mb-3">'
                        }
                        
                        temp_commentCard += '\
                                        <h4 class="card-text">'+comment.content+'</h4>\
                                        <div class="row">\
                                            <h6 class="col-4 card-subtitle ' + comment.userID + '-username">'+comment.userID+'</h6>\
                                            <h6 class="col-8 card-text text-muted">'+comment_time+'</h6>\
                                        </div>\
                                    </div>'
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
    })
}

function dismissNewMapNotification(musicID){
    var updates = {}
    updates[musicID] = "dismissed";
    DB.ref('users/' + currentUser.uid + '/NewMapNotification').update(updates)
}

function getHistoryList(){
    $("#game-history").html(""); // clean up histories

    DB.ref('users').get().then(users => {
        friendUIDtoUsername = {}
        if (!Object.keys(users.val()[currentUser.uid]).includes("friends")) var userAndFriendsID = [currentUser.uid]
        else {
            var userAndFriendsID = Object.keys(users.val()[currentUser.uid].friends)
            userAndFriendsID.push(currentUser.uid)
        }

        DB.ref('game_history').get().then(histories => {
            var historylist = ""
            histories.forEach(history_snapshot => {
                var history = history_snapshot.val()
                if (userAndFriendsID.includes(history.userID)){
                    var play_time = new Date(history.dateAndTimeUTC + 'Z');
                    play_time = play_time.toString().split(' ')
                    play_time = play_time[2] + ' ' + play_time[1] + ' ' + play_time[3] + ' ' + play_time[4];
                    
                    var historyCard = '';
                    if (history.userID == currentUser.uid) historyCard += '<div class="card bg-gradient mb-3" style="background-color: AliceBlue">'
                    else historyCard += '<div class="card bg-light bg-gradient mb-3">'
                    historyCard += '\
                        <div class="card-body">\
                        <div class="row">\
                            <h4 class="card-title col-6">'+history.musicID+'</h4>\
                            <h5 class="card-text col-6" style="text-align: right"><strong>Score: <span id="'+history.musicID.split(' ').join('_')+'_' + history.userID + '_score">'+history.score+'</span></strong></h5>\
                        </div>\
                        <p class="card-text">\
                            Perfect: '+history.spec.perfect+' Good: '+history.spec.good+' Miss: ' + history.spec.missed +'\
                            </p>'
                    if (history.userID == currentUser.uid){
                        historyCard += '    <h6 class="card-subtitle mb-2 text-muted"><span style="color: DarkBlue">you</span> played at '+ play_time +'</h6>'
                    }else{
                        historyCard += '    <h6 class="card-subtitle mb-2 text-muted"><strong style="color: DarkGreen">'+ users.val()[history.userID].username +'</strong> played at '+ play_time +'</h6>'
                    }
                    historyCard += '\
                        </div>\
                    </div>'
                    
                    // add to friend's detail card
                    $("#" + history.userID + "_userGameHistory").html(historyCard + $("#" + history.userID + "_userGameHistory").html());
                    
                    historylist = historyCard+historylist
                }
            })
            $("#game-history").html(historylist);
            
        })
    })
}

function postComment(musicID){
    var comment = $("#"+musicID.split(' ').join('_')+"-commentinput").val();
    if (comment == '') return
    DB.ref("songs/" + musicID + "/comments").push({
        dateAndTimeUTC: getUTCDateAndTime(),
        content: comment,
        userID: currentUser.uid
    });
    alert("comment posted!")
    $("#"+musicID.split(' ').join('_')+"-commentinput").val("");
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

// exploiting bug so that iPhone users no longer need to confirm grand access
if (navigator.platform == "iPhone"){
    DeviceMotionEvent.requestPermission();
}

function getAccel(){
    if ($("#start-game-button").html() == 'Recalibrate') location.reload();

    if (navigator.platform == "iPhone"){
        DeviceMotionEvent.requestPermission().then(response => {
            if (response == 'granted') processDeviceOrientation();
        });
    }else{
        processDeviceOrientation();
    }
}

function processDeviceOrientation(){
    window.addEventListener('deviceorientation',(event) => {
        // tell server that orientation info has been granted
        ws.send('g');
    
        // Expose each orientation angle in a more readable way
        rotation_degrees = event.alpha;
        frontToBack_degrees = event.beta;
        leftToRight_degrees = event.gamma;
        var rd = Math.trunc(rotation_degrees);
        var fd = Math.trunc(frontToBack_degrees);
        var ld = Math.trunc(leftToRight_degrees);
        ws.send("gyro:" + event.alpha + " " + event.beta + " " + event.gamma);

    });
}

function selectMusic(mp3URL, csvURL){
    ws.send("musicselected: " + mp3URL + " " + csvURL);
    console.log("musicselected: " + mp3URL + " " + csvURL);
}

function getFriendsList(){
    DB.ref('users/' + currentUser.uid).get().then(user => {
        $("#listOfFriends").html('\
            <div class="input-group mb-3" id="friend-search">\
                <input type="text" class="form-control" placeholder="Search username..." aria-label="Username" id="friend-username-input">\
                <button class="btn btn-outline-primary" type="button" onclick="newFriend($(\'#friend-username-input\').val())">Add friend</button>\
            </div>');
        if (!user.exists() || !Object.keys(user.val()).includes("friends")) {
            $("#listOfFriends").append("No friends yet. Add some friends now!")
            return
        }
        var friends = user.val().friends;
        for(const friendID in friends){
            DB.ref('users/'+friendID).get().then(friend => {
                var friendcard = ""
                var friend_time = new Date(friends[friendID].friend_time + 'Z');
                friend_time = friend_time.toString().split(' ')
                friend_time = friend_time[2] + ' ' + friend_time[1] + ' ' + friend_time[3];

                var friend_last_login = new Date(friend.val().lastLoginDateAndTimeUTC + 'Z');
                friend_last_login = friend_last_login.toString().split(' ')
                friend_last_login = friend_last_login[2] + ' ' + friend_last_login[1] + ' ' + friend_last_login[3];

                friendcard += '\
                <div class="card mb-3">\
                    <div class="card-body" style="text-align: center;">\
                        <div class="row">\
                            <h4 class="card-title col-8" style="text-align: left;">'+friend.val().username+'</h4>\
                            <div class="col-4" style="text-align: right;">\
                                <button class="btn btn-outline-secondary" onclick="removeFriend(\''+friendID+'\')">remove</button>\
                            </div>\
                        </div>\
                        <h6 class="card-subtitle mb-2 text-muted" style="text-align: left;">Last login on '+ friend_last_login +'</h6>\
                        <h6 class="card-subtitle mb-2 text-muted" style="text-align: left;">Friended on '+ friend_time +'</h6>\
                        <a href="#' + friendID + '_userDetail" class="btn btn-primary collapsed" data-bs-toggle="collapse" aria-expanded="false" aria-controls="#' + friendID + '_userDetail" style="width: 60%;" onclick="getHistoryList()">Game history</a>\
                        <div class="collapse" id="' + friendID + '_userDetail">\
                            <hr>\
                            <div id="' + friendID + '_userGameHistory" class="overflow-auto mb-3" style="padding: 0px; max-height: 50vh; text-align: left;"></div>\
                        </div>\
                    </div>\
                </div>'

                $("#listOfFriends").append(friendcard);
            })
        }
    })
}

function newFriend(friend_username){
    DB.ref('users').orderByChild("username").equalTo(friend_username).get().then(search_result => {
        if (!search_result.exists()){
            alert("User does not exist!")
            return
        }
        var friend_uid = Object.keys(search_result.val())[0]
        DB.ref('users/'+currentUser.uid+'/friends/'+friend_uid).get().then(friend=>{
            if(friend.exists()){
                alert("You have previously added "+friend_username+" as your friend.")
            }else{
                DB.ref('users/'+currentUser.uid+'/friends/'+friend_uid).set({
                    friend_time: getUTCDateAndTime()
                })

                // refresh friends list
                getFriendsList()
            }
        })
    })
}

function removeFriend(friend_uid){
    DB.ref('users/'+currentUser.uid+'/friends/'+friend_uid).get().then(snapshot=>{
        if(!snapshot.exists()){
            alert("already removed")
            return
        }
        DB.ref('users/'+currentUser.uid+'/friends/'+friend_uid).remove()
        
        //refresh friends list
        getFriendsList()
    })
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
    getHistoryList();
    getLeaderboard();
}

// for test only
// function testFunction(){
//     DB.ref('songs/song1').set({
//         "difficulty": "mid",
//         "details": {
//             "author": "pp0r2amgbrfwcmnggM0SBatITRP2",
//             "creationTime": "2021-07-12T16:21:07"
//         }
//     })
// }