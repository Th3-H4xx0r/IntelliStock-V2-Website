


function login() {
    document.getElementById('login-btn').innerHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`
    document.getElementById('login-btn').disabled = true;

    var error = document.getElementById('error');

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value

    console.log("WORKING")

    if (email && password) {

        var authValid = true;

        console.log("FIRST: " + authValid.toString())

        error.innerHTML = ''

        try {

            firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
                console.log("LOGIN VALID")
                error.innerHTML = ''

                window.location = '/dashboard'


            }).catch(err => {

                error.innerHTML = "Incorrect credentials";

                authValid = false;

                document.getElementById('login-btn').innerHTML = `Login`
                document.getElementById('login-btn').disabled = false;

            })
        } catch (error) {
            console.log(error)

            console.log(errorMessage);
        }

    } else {
        document.getElementById('login-btn').innerHTML = `Login`
        document.getElementById('login-btn').disabled = false;
        error.innerHTML = "You cannot leave any fields blank"
    }
}


function signup() {
    document.getElementById('signup-btn').innerHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`
    document.getElementById('signup-btn').disabled = true;

    var errorMSG = document.getElementById('error');

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    var name = document.getElementById('name').value
    var repeatPassword = document.getElementById('repeatPassword').value

    var authValid = true

    if (email && password && name && repeatPassword) {

        if (password == repeatPassword) {
            errorMSG.innerHTML = ''

                firebase.auth().createUserWithEmailAndPassword(email, password).catch(error => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
    
                    console.log(error)
    
                    console.log(errorMessage);
    
                    errorMSG.innerHTML = errorMessage;
    
                    document.getElementById('signup-btn').innerHTML = `Login`
                    document.getElementById('signup-btn').disabled = false;

                    authValid = false
                }).then(() => {
                    if(authValid == true){

                        var user = firebase.auth().currentUser;

                        user.updateProfile({
                            displayName: name,
                          }).then(function() {
                            

                        firebase.firestore().collection("UserData").doc(email).set({
                            'name': name,
                            'email': email
                        }).then(() => {
                            document.getElementById('signup-content').style.display = "none"
                            document.getElementById('signup-success').style.display = "initial"
                        })

                          }).catch(function(error) {
                            errorMSG.innerHTML = error;
                          });
                          

                    }




                })
            
        } else {
            errorMSG.innerHTML = 'Password and repeat password do not match'
            document.getElementById('signup-btn').innerHTML = `Login`
            document.getElementById('signup-btn').disabled = false;
        }



    } else {
        document.getElementById('signup-btn').innerHTML = `Login`
        document.getElementById('signup-btn').disabled = false;
        errorMSG.innerHTML = "You cannot leave any fields blank"
    }
}