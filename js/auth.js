


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

                window.location = '/'


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

    var error = document.getElementById('error');

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    var name = document.getElementById('name').value
    var repeatPassword = document.getElementById('repeatPassword').value

    console.log("WORKING")

    if (email && password && name && repeatPassword) {

        if (password == repeatPassword) {
            error.innerHTML = ''

            try {

                firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
                    error.innerHTML = ''

                    window.location = '/'


                }).catch(err => {

                    console.log(err)

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
            error.innerHTML = 'Password and repeat password do not match'
        }



    } else {
        document.getElementById('login-btn').innerHTML = `Login`
        document.getElementById('login-btn').disabled = false;
        error.innerHTML = "You cannot leave any fields blank"
    }
}