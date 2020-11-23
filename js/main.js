function getAccountHistory(){
    var alpaca = require('alpaca')
}

function getUserInstances(){

    console.log("WORKING")
    
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;

      console.log(email)

      var currentIndex = 0;

      firebase.firestore().collection('Instances').where('user', '==', email).orderBy('instanceNum', 'asc').onSnapshot(snap => {
        console.log("GOT DATA")

        document.getElementById('instances-list').innerHTML = ''

        var selectedInstance = localStorage.getItem('selectedInstance')
          snap.forEach(doc => {

            var data = doc.data()
              console.log(data)

            var instanceNum = data['instanceNum']

              var selectedHTML = `

              <div class="d-flex justify-content-center">
               <a href="#" onclick = 'changeInstanceClicked("${doc.id}")' style = 'text-decoration: none'>
                <div class="row" >
                    <div class="instance-profile-bar"></div>
                    <div class="instance-profile-selected"><h1 style = 'color: white; margin-left: 1.7rem; padding-top: 0.8rem'>${instanceNum}</h1></div>
                </div>
               </a>
            </div>`

              var nonSelectedHTML = `<div class="d-flex justify-content-center">
              <a href="#" onclick = 'changeInstanceClicked("${doc.id}")' style = 'text-decoration: none'>
                   <div class="instance-profile"><h1 style = 'color: white; margin-left: 1.7rem; padding-top: 0.8rem'>${instanceNum}</h1></div>
              </a>
           </div>`

              if(selectedInstance){
                if(selectedInstance == doc.id){
                    $(selectedHTML).appendTo('.first-bar');
                  } else {
                    $(nonSelectedHTML).appendTo('.first-bar');
                  }
              } else {
                if(currentIndex == 0){
                    localStorage.setItem('selectedInstance', doc.id);
                      $(selectedHTML).appendTo('.first-bar');
                } else {
  
                }
              }

              

              currentIndex += 1;
          })
      })
    } else {
        console.log("Signed out")
    }
})
}

function changeInstanceClicked(instanceID){
    localStorage.setItem('selectedInstance', instanceID)
    window.location = '/dashboard'
}