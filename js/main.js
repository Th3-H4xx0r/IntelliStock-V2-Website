function getAccountHistory(key, secret){
    var Http = new XMLHttpRequest();
    const url = 'http://localhost:3102/getBalance'
    Http.open("GET", url)
    Http.setRequestHeader('key', key)
    Http.setRequestHeader('secret', secret)
    Http.send()

    Http.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){

        var response = JSON.parse(Http.responseText)

        var message = response['message']

        var values = message['equity']

        var rawTimes = message['timestamp']

        
        var points = []



        for(var i = 0; i <= rawTimes.length; i++){
          if(rawTimes[i] != null && values[i] != null){
            points.push({t: new Date(rawTimes[i] * 1000), y: values[i]})
          }

        }

        console.log(points)


/*
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'hour'
                    }
                }]
            }
*/

var ctx = document.getElementById("myChart").getContext("2d");

var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Equity',
      data: points,
      backgroundColor: [
        '#151515'
      ],
      borderColor: [
        '#00CF98',

      ],
      borderWidth: 5
    }]
  },
  options: {
    scales: {
      xAxes: [{
        type: 'time',
        distribution: 'linear'
      }]
    }
  }
});
      }
    }


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
                    <div class="instance-profile-selected"><center><h1 style = 'color: white; padding-top: 0.5rem'>${instanceNum}</h1></center></div>
                </div>
               </a>
            </div>`

              var nonSelectedHTML = `<div class="d-flex justify-content-center">
              <a href="#" onclick = 'changeInstanceClicked("${doc.id}")' style = 'text-decoration: none'>
                   <div class="instance-profile"><center><h1 style = 'color: white; padding-top: 0.5rem'>${instanceNum}</h1></center></div>
              </a>
           </div>`

           var instanceStatus = data['running']

              if(selectedInstance){
                if(selectedInstance == doc.id){
                    $(selectedHTML).appendTo('.first-bar');
                    document.getElementById('instance-name').innerHTML = `Instance ${instanceNum}`

                    getAccountHistory(data['key'], data['secret'])

                    if(instanceStatus == false){
                        document.getElementById('server-icon-status').innerHTML = `<img src = 'Assets/center_SERVER_ICON_red.png'  style="margin-top: 3rem;" />`
                    }

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