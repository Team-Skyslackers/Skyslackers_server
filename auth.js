// Register function
$("#register-button").click(function(){
    var email = $("#inputRegEmail").val();
    var password = $("#inputRegPassword").val();
    RegisterUser(email, password);
})
function RegisterUser(email, password){
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;

            console.log("Successfully registered new user");
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;

            alert(errorMessage);
        });
}

// Login function
$("#signin-button").click(function(){
var email = $("#inputEmail").val();
var password = $("#inputPassword").val();
SigninUser(email, password);
})

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
$("#google-signin-button").click(function(){
    console.log("Google signin button triggered");
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
})

// Logout function
$("#signout-button").click(function(){
firebase.auth().signOut()
    .then(() => {
        console.log("Succesfully signed out");
    })
    .catch((error) => {
        console.log(error.message);
    });
})

// Change in authentication state
var currentUser = {};
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        var email = user.email;
        currentUser = user;
        $("#signin-form").addClass("d-none");
        $("#signout-form").removeClass("d-none");

        console.log(email + " has signed in");
        // ...
    } else {
        // User is signed out
        // ...
        $("#signin-form").removeClass("d-none");
        $("#signout-form").addClass("d-none");

        console.log("No user signed in")
    }
    });
