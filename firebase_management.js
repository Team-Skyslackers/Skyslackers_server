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


function newScore(musicId, Uid, Score, Time){
    console.log("update database");
    firebase.database().ref('users/' + musicId).set({
        uid: Uid,
        score: Score,
        time: Time
      });
}