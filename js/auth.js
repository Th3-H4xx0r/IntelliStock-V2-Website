function login(){
    document.getElementById('login-btn').innerHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`
    document.getElementById('login-btn').disabled = true;

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value

    console.log(email)
    console.log(password)
}