function getAccountHistory(key, secret){
    var Http = new XMLHttpRequest();
    const url = 'https://intellistock.protosystems.net/getBalance'
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
    legend: {
      display: false
  },
  tooltips: {
    callbacks: {
       label: function(tooltipItem) {
              return tooltipItem.yLabel;
       }
    }
},
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

function getUserInstances(pageType){

    console.log("WORKING")
    
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;

      console.log(email)

      var currentIndex = 0;

      var instanceCount = 0;

      firebase.firestore().collection('Instances').where('user', '==', email).orderBy('instanceNum', 'asc').onSnapshot(snap => {

        localStorage.removeItem('maxInstanceNum')
        console.log("GOT DATA")

        document.getElementById('instances-list').innerHTML = ''

        var selectedInstance = localStorage.getItem('selectedInstance')
          snap.forEach(doc => {

            instanceCount += 1;

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

           localStorage.setItem('maxInstanceNum', data['instanceNum'])

              if(selectedInstance){
                if(selectedInstance == doc.id){
                    $(selectedHTML).appendTo('.first-bar');
                    document.getElementById('instance-name').innerHTML = `Instance ${instanceNum}`

                    if(pageType == 'dashboard'){
                      getAccountHistory(data['key'], data['secret'])
                    } else if(pageType == 'stocks-screen'){
                      getInstanceStocks()
                    }



                    if(instanceStatus == false){
                        document.getElementById('server-icon-status').innerHTML = `<img src = 'Assets/center_SERVER_ICON_red.png'  style="margin-top: 3rem;" />`
                    } else if(instanceStatus == true){
                      document.getElementById('server-icon-status').innerHTML = `<img src = 'Assets/center_server_cion_green.png'  style="margin-top: 3rem;" />`

                    }

                  } else {
                    $(nonSelectedHTML).appendTo('.first-bar');
                  }
              } else {
                if(currentIndex == 0){
                    localStorage.setItem('selectedInstance', doc.id);
                      $(selectedHTML).appendTo('.first-bar');

                      if(pageType == 'dashboard'){
                        getAccountHistory(data['key'], data['secret'])
                      } else if(pageType == 'stocks-screen'){
                        getInstanceStocks()
                      }
                }
              }

              

              currentIndex += 1;
          })

          setTimeout(function(){
            if(instanceCount == 0){
              console.log("No instances")
              document.getElementById('loading-page').style.display = 'none'
              document.getElementById('no-instances').style.display = 'initial'
              document.getElementById('content-main-page').style.display = 'none'
            } else {
              console.log("YES instances")
              document.getElementById('no-instances').style.display = 'none'
              document.getElementById('loading-page').style.display = 'none'
             document.getElementById('content-main-page').style.display = 'initial'
            }
           }, 2000);



          var addInstanceHTML = `<div class="d-flex justify-content-center">
          <a href="#" onclick = 'createInstancePopup()' style = 'text-decoration: none'>
               <div class="instance-profile-add"><center><h1 style = 'color: white;'>+</h1></center></div>
          </a>
       </div>`

       $(addInstanceHTML).appendTo('.first-bar');
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

function getInstanceStocks(){
  var currentInstance = localStorage.getItem('selectedInstance')

  console.log(currentInstance)

  firebase.firestore().collection("Instances").doc(currentInstance).collection('Stocks').onSnapshot(snap => {
    document.getElementById('instance-stocks').innerHTML = ``

    snap.forEach(doc => {


      var data = doc.data();

      console.log(data)

      if(data['ticker'].length < 4){
        for(var i = 0; i <= 4 -data['ticker'].length; i++){
          data['ticker'] = data['ticker'] + " "
        }
      }

      if(data){
        var cardHTML = `
        
        <div class="stock-card-manage">

        <div class="row">
            <h4 style="color: white; padding-top: 2%; margin-left: 5%;">${data['ticker']}</h4>

            <h5 style="color: rgb(172, 172, 172); padding-top: 2%; margin-left: 14%;">${data['added']}</h5>

            <h5 style="color: rgb(172, 172, 172); padding-top: 2%; margin-left: 15%; ">$${numberWithCommas(data['maxValue'])}</h5>


            <button class="stock-card-option-btn" style="margin-left: 23%;" onclick = "removeStock('${currentInstance}', '${data['ticker']}')">Remove</button>

            <button class="stock-card-option-btn" style="margin-left: 1%" onclick = "viewDetails('${currentInstance}', '${data['ticker']}')">View</button>

        </div>
    </div>
        `

        $(cardHTML).appendTo('#instance-stocks');
      }
    })

    


  })
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function createInstancePopup(){
  var modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="createInstanceModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header" style = 'background-color: #272727; color: white'>
        <h5 class="modal-title" id="exampleModalLabel">Create Instance</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style = 'background-color: #272727; color: white'>

      <h4>Instance Type</h4>

      <input type="radio" id="alpaca" name="alpaca" value="alpaca">
<label for="alpaca">Alpaca</label><br>

<input type="radio" id="webull" name="webull" value="webull" disabled>
<label for="webull">Webull (Comming soon)</label><br>


          <div class="form-group">
            <label for="recipient-name" class="col-form-label">Alpaca Key</label>
            <input type="text" class="form-control" id="alpaca-key" style = 'background-color: #272727; color: white; border: 2px solid #00CF98'>
          </div>
          <div class="form-group">
            <label for="message-text" class="col-form-label">Alpaca Secret</label>
            <input type="password" class="form-control" id="alpaca-secret" style = 'background-color: #272727; color: white; border: 2px solid #00CF98'>
          </div>


        <p id = 'error-create-instance' style = "color: red"></p>
      </div>
      <div class="modal-footer" style = 'background-color: #272727; color: white'>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <div class="d-flex justify-content-center" style="margin-top: 1rem;">
        <button class="create-btn" id = 'create-btn' onclick="createInstance()">Create Instance</button>
    </div>
      </div>
    </div>
  </div>
</div>
  `

  $(modalHTML).appendTo('#page-main')

  $('#createInstanceModal').modal('toggle')


}

function createInstance(){

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;

      
  var key = document.getElementById('alpaca-key').value
  var secret = document.getElementById('alpaca-secret').value

  var error = document.getElementById('error-create-instance')

  var button = document.getElementById('create-btn')

  button.innerHTML = `<div class="lds-ring" style = 'margin-left: 3rem; margin-right: 3rem'><div></div><div></div><div></div><div></div></div>`

  //console.log(key)
  //console.log(secret)

  if(key && secret){
    //firebase.firestore().collection("Instances").doc().set({})
    error.innerHTML = ""

    var Http = new XMLHttpRequest();
    const url = 'https://intellistock.protosystems.net/verifyCreds'
    Http.open("GET", url)
    Http.setRequestHeader('key', key)
    Http.setRequestHeader('secret', secret)
    Http.send()

    Http.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){

        var response = JSON.parse(Http.responseText)

        var message = response['message']

        var numRaw = localStorage.getItem('maxInstanceNum')

        var num = 1

        if(numRaw){
          num =  parseInt(numRaw) + 1
        } 

        if(message == 'Valid'){
          firebase.firestore().collection('Instances').doc().set({
            'key': key,
            'secret': secret, 
            'user': email,
            'running': false,
            'runCommand': true,
            'instanceNum': num

          }).then(() => {
            setTimeout(function(){ 
              window.location.reload()
             }, 2000);

          })
        } else {
          error.innerHTML = "Alpaca credentials are invalid"
          button.innerHTML = `Create Instance`
        }
    }

  } 
}else { 
    error.innerHTML = "Fields cannnot be left blank"
    button.innerHTML = `Create Instance`


  }


    } else {
      var error = document.getElementById('error-create-instance')

      error.innerHTML = "Auth error: User not signed in"
    }
  })


}

function addStockPopup(){
  var modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="addStockModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header" style = 'background-color: #272727; color: white'>
        <h5 class="modal-title" id="exampleModalLabel">Add Stock</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style = 'background-color: #272727; color: white'>

      <h4>Watch Type</h4>

      <input type="radio" id="alpaca" name="alpaca" value="alpaca" disabled>
<label for="alpaca">Long Term (Comming soon)</label><br>

<input type="radio" id="webull" name="webull" value="webull">
<label for="webull">Short Term</label><br>


          <div class="form-group">
            <label for="recipient-name" class="col-form-label">Ticker</label>
            <input type="text" class="form-control" id="tickerInput" style = 'background-color: #272727; color: white; border: 2px solid #00CF98'>
          </div>
          <div class="form-group">
            <label for="message-text" class="col-form-label">Max Spend Value</label>
            <input type="number" class="form-control" id="maxValue" style = 'background-color: #272727; color: white; border: 2px solid #00CF98'>
          </div>


        <p id = 'error-add-stock' style = "color: red"></p>
      </div>
      <div class="modal-footer" style = 'background-color: #272727; color: white'>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <div class="d-flex justify-content-center" style="margin-top: 1rem;">
        <button class="create-btn" id = 'add-stock-btn' onclick="addStock()">Add Stock</button>
    </div>
      </div>
    </div>
  </div>
</div>
  `

  $(modalHTML).appendTo('#page-main')

  $('#addStockModal').modal('toggle')


}


function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');

  return month + '/' + day + '/' + year;
}

function addStock(){
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var email = user.email;

      
    var ticker = document.getElementById('tickerInput').value
    var maxValue = document.getElementById('maxValue').value

    var error = document.getElementById('error-add-stock')

    var button = document.getElementById('add-stock-btn')

  button.innerHTML = `<div class="lds-ring" style = 'margin-left: 3rem; margin-right: 3rem'><div></div><div></div><div></div><div></div></div>`

  //console.log(key)
  //console.log(secret)

  if(ticker && maxValue){
    //firebase.firestore().collection("Instances").doc().set({})
    error.innerHTML = ""

    var Http = new XMLHttpRequest();
    const url = 'http://localhost:3102/verifyTicker'
    Http.open("GET", url)
    Http.setRequestHeader('ticker', ticker)
    Http.send()

    var currentInstance = localStorage.getItem('selectedInstance')

    Http.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){

        var response = JSON.parse(Http.responseText)

        var message = response['message']

        if(message == 'Valid'){
          firebase.firestore().collection('Instances').doc(currentInstance).collection('Stocks').doc(ticker).set({
            'currentStatus': false,
            "maxValue": maxValue.toString(),
            'run': true,
            "ticker": ticker,
            'added': getFormattedDate(new Date())

          }).then(() => {
            setTimeout(function(){ 
              window.location.reload()
             }, 1000);

          })
        } else {
          error.innerHTML = "Ticker is not valid"
          button.innerHTML = `Add Stock`
        }
    }

  } 
}else { 
    error.innerHTML = "Fields cannnot be left blank"
    button.innerHTML = `Create Instance`


  }


    } else {
      var error = document.getElementById('error-create-instance')

      error.innerHTML = "Auth error: User not signed in"
    }
  })

}

function removeStock(instanceID, ticker){
  firebase.firestore().collection("Instances").doc(instanceID).collection("Stocks").doc(ticker).delete()
}


function logout(){
  firebase.auth().signOut().then(function() {
    window.location = '/'
  }).catch(function(error) {
    console.log("An error occured: " + error.toString())
  })
}