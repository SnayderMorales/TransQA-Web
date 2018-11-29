document.getElementById('botonlogin').addEventListener('click', function () {
    var authService = firebase.auth();
    var provider = new firebase.auth.GoogleAuthProvider();
    //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
        console.log(result);
        console.log('token: ' + token);
        console.log('user: ' + user);
        console.log(user);
        location.href ="index.html";
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log('error errorCode: ' + errorCode);
        console.log('error: ' + error);
        console.log('errorMessage: ' + errorMessage);
        console.log('email: ' + email);
        console.log('credential: ' + credential);
    });
});