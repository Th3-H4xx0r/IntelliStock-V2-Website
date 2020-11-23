

function login(){
    document.getElementById('login-btn').innerHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`
    document.getElementById('login-btn').disabled = true;

    var error = document.getElementById('error');

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value

    if(email != null && email != '' && password != null && password != ''){

    var authValid = true;

    try{
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
    
            console.log(errorMessage);
    
            error.innerHTML = errorMessage;
    
            authValid = false;
            // ...
        }).then(() => {
            console.log(authValid)
            if(authValid == true){
                error.innerHTML = ''
            } else {
                document.getElementById('login-btn').innerHTML = `Login`
                document.getElementById('login-btn').disabled = false;
            }
        })
    } catch(e){
        console.log(e)
    }




    } else {
        document.getElementById('login-btn').innerHTML = `Login`
        document.getElementById('login-btn').disabled = false;
        error.innerHTML = "You cannot leave any fields blank"
    }
}