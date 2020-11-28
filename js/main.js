function getAccountHistory(key, secret) {
  var Http = new XMLHttpRequest();
  const url = 'https://intellistockapi.loca.lt/getBalance'
  Http.open("GET", url)
  Http.setRequestHeader('key', key)
  Http.setRequestHeader('secret', secret)
  Http.send()

  Http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      var response = JSON.parse(Http.responseText)

      var message = response['message']

      var values = message['equity']

      var rawTimes = message['timestamp']

      var points = []



      for (var i = 0; i <= rawTimes.length; i++) {
        if (rawTimes[i] != null && values[i] != null) {
          points.push({ t: new Date(rawTimes[i] * 1000), y: values[i] })
        }

      }



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
              label: function (tooltipItem) {
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

function getStockGraph(instance, stock) {
  console.log(instance)
  var Http = new XMLHttpRequest();
  const url = `https://intellistockapi.loca.lt/getOverallData?instance=${instance}`
  Http.open("GET", url)
  Http.send()

  var pricesList = []


  Http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      var response = JSON.parse(Http.responseText)

      var message = response['message']

      console.log(message)

      var points = []

      var stockData = message[stock]['todayPrices']
      var transactionData = message[stock]['transactions']

      var transactionsCount = 0

      var buyCount = 0
      var sellCount = 0

      var priceData = []

      var buyData = []
      var sellData = []
      if (stockData) {

        for (var i = 0; i <= stockData.length; i++) {
          if (stockData[i] != null) {
            pricesList.push(stockData[i][1])
            points.push({ t: new Date(stockData[i][2] * 1000), y: stockData[i][1] })
            priceData.push({ date: new Date(stockData[i][2] * 1000), value: stockData[i][1] });
          }

        }

      }

      if (transactionData) {

        for (var i = 0; i <= transactionData.length; i++) {
          if (transactionData[i] != null) {
            transactionsCount += 1
            var action = transactionData[i][1]

            if (action == "BUY") {
              buyCount += 1
              buyData.push({ date: new Date(transactionData[i][3] * 1000), value: transactionData[i][2] });
            } else if (action == "SELL") {
              sellCount += 1
              sellData.push({ date: new Date(transactionData[i][3] * 1000), value: transactionData[i][2] });

            }
          }

        }

      }


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
      console.log(pricesList)



      var min = Math.min.apply(null, pricesList),
        max = Math.max.apply(null, pricesList);

      document.getElementById('maxprice').innerHTML = "$" + max
      document.getElementById('minprice').innerHTML = "$" + min

      document.getElementById('totalOrders').innerHTML = transactionsCount
      document.getElementById('buyOrders').innerHTML = buyCount
      document.getElementById('sellOrders').innerHTML = sellCount
      /**
       * ---------------------------------------
       * This demo was created using amCharts 4.
       *
       * For more information visit:
       * https://www.amcharts.com/
       *
       * Documentation is available at:
       * https://www.amcharts.com/docs/v4/
       * ---------------------------------------
       */

      am4core.useTheme(am4themes_animated);

      // Create chart instance
      var chart = am4core.create("chartdiv", am4charts.XYChart);

      // Create axes
      var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.minGridDistance = 30;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      // Create series
      function createSeries(field, name, priceData, type) {
        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.dateX = "date";
        series.name = name;
        series.tooltipText = "{dateX}: [b]{valueY}[/]";
        series.strokeWidth = 2;
        series.data = priceData;

        if (type == 'buy') {
          var bullet = series.bullets.push(new am4charts.CircleBullet());
          bullet.circle.stroke = am4core.color("#00FF00");
          bullet.circle.strokeWidth = 2;
        } else if (type == 'sell') {
          var bullet = series.bullets.push(new am4charts.CircleBullet());
          bullet.circle.stroke = am4core.color("#FF0000");
          bullet.circle.strokeWidth = 2;
        }


        return series;
      }

      createSeries("value", "Prices", priceData, 'price');

      for(buyPoint in buyData){
        var point = [buyData[buyPoint]]
        createSeries("value", "Buy", point, 'buy');
      }

      
      for(sellPoint in sellData){
        var point = [sellData[sellPoint]]
        createSeries("value", "Sell", point, 'sell');
      }

      chart.legend = new am4charts.Legend();
      chart.cursor = new am4charts.XYCursor();

      // Set up export
      chart.exporting.menu = new am4core.ExportMenu();
      chart.exporting.adapter.add("data", function (data, target) {
        // Assemble data from series
        var data = [];
        chart.series.each(function (series) {
          for (var i = 0; i < series.data.length; i++) {
            series.data[i].name = series.name;
            data.push(series.data[i]);
          }
        });
        return { data: data };
      });

      /*
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
      
      plugins: {
        zoom: {
          // Container for pan options
          pan: {
            // Boolean to enable panning
            enabled: true,
      
            // Panning directions. Remove the appropriate direction to disable
            // Eg. 'y' would only allow panning in the y direction
            // A function that is called as the user is panning and returns the
            // available directions can also be used:
            //   mode: function({ chart }) {
            //     return 'xy';
            //   },
            mode: 'xy',
      
            rangeMin: {
              // Format of min pan range depends on scale type
              x: null,
              y: null
            },
            rangeMax: {
              // Format of max pan range depends on scale type
              x: null,
              y: null
            },
      
            // On category scale, factor of pan velocity
            speed: 20,
      
            // Minimal pan distance required before actually applying pan
            threshold: 10,
      
            // Function called while the user is panning
            //onPan: function({chart}) { console.log(`I'm panning!!!`); },
            // Function called once panning is completed
            //onPanComplete: function({chart}) { console.log(`I was panned!!!`); }
          },
      
          // Container for zoom options
          zoom: {
            // Boolean to enable zooming
            enabled: true,
      
            // Enable drag-to-zoom behavior
            drag: false,
      
            // Drag-to-zoom effect can be customized
            // drag: {
            // 	 borderColor: 'rgba(225,225,225,0.3)'
            // 	 borderWidth: 5,
            // 	 backgroundColor: 'rgb(225,225,225)',
            // 	 animationDuration: 0
            // },
      
            // Zooming directions. Remove the appropriate direction to disable
            // Eg. 'y' would only allow zooming in the y direction
            // A function that is called as the user is zooming and returns the
            // available directions can also be used:
            //   mode: function({ chart }) {
            //     return 'xy';
            //   },
            mode: 'xy',
      
            rangeMin: {
              // Format of min zoom range depends on scale type
              x: null,
              y: null
            },
            rangeMax: {
              // Format of max zoom range depends on scale type
              x: null,
              y: null
            },
      
            // Speed of zoom via mouse wheel
            // (percentage of zoom on a wheel event)
            speed: 0.1,
      
            // Minimal zoom distance required before actually applying zoom
            threshold: 2,
      
            // On category scale, minimal zoom level before actually applying zoom
            sensitivity: 3,
      
            // Function called while the user is zooming
            //onZoom: function({chart}) { console.log(`I'm zooming!!!`); },
            // Function called once zooming is completed
            //onZoomComplete: function({chart}) { console.log(`I was zoomed!!!`); }
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
      
      */
    }
  }


}

function getUserInstances(pageType, ticker = 'TSLA') {

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;


      var currentIndex = 0;

      var instanceCount = 0;

      firebase.firestore().collection('Instances').where('user', '==', email).orderBy('instanceNum', 'asc').onSnapshot(snap => {

        localStorage.removeItem('maxInstanceNum')


        document.getElementById('instances-list').innerHTML = ''

        var selectedInstance = localStorage.getItem('selectedInstance')
        snap.forEach(doc => {

          instanceCount += 1;

          var data = doc.data()

          var instanceNum = data['instanceNum']

          var selectedHTML = `

              <div class="d-flex justify-content-center">
               <a href="#" onclick = 'changeInstanceClicked("${doc.id}")' style = 'text-decoration: none'>
                <div class="row" >
                    <div class="instance-profile-bar"></div>
                    <div class="instance-profile-selected"><center><h2 style = 'color: white; padding-top: 0.5rem'>${instanceNum}</h2></center></div>
                </div>
               </a>
            </div>`

          var nonSelectedHTML = `<div class="d-flex justify-content-center">
              <a href="#" onclick = 'changeInstanceClicked("${doc.id}")' style = 'text-decoration: none'>
                   <div class="instance-profile"><center><h2 style = 'color: white; padding-top: 0.5rem'>${instanceNum}</h2></center></div>
              </a>
           </div>`

          var instanceStatus = data['running']

          localStorage.setItem('maxInstanceNum', data['instanceNum'])

          if (selectedInstance) {
            if (selectedInstance == doc.id) {
              $(selectedHTML).appendTo('.first-bar');
              document.getElementById('instance-name').innerHTML = `Instance ${instanceNum}`

              if (pageType == 'dashboard') {
                getAccountHistory(data['key'], data['secret'])
                getDashboardStats()
              } else if (pageType == 'stocks-screen') {
                getInstanceStocks()
              } else if (pageType == 'stock-info-screen') {
                getStockGraph(doc.id, ticker)
              }



              if (instanceStatus == false) {
                document.getElementById('server-icon-status').innerHTML = `<img src = 'Assets/center_SERVER_ICON_red.png'  style="margin-top: 3rem;" />`
              } else if (instanceStatus == true) {
                document.getElementById('server-icon-status').innerHTML = `<img src = 'Assets/center_server_cion_green.png'  style="margin-top: 3rem;" />`

              }

            } else {
              $(nonSelectedHTML).appendTo('.first-bar');
            }
          } else {
            if (currentIndex == 0) {
              localStorage.setItem('selectedInstance', doc.id);
              $(selectedHTML).appendTo('.first-bar');

              if (pageType == 'dashboard') {
                getAccountHistory(data['key'], data['secret'])
                getDashboardStats()
              } else if (pageType == 'stocks-screen') {
                getInstanceStocks()
              } else if (pageType == 'stock-info-screen') {
                getStockGraph(doc.id, ticker)
              }
            }
          }



          currentIndex += 1;
        })

        setTimeout(function () {
          if (instanceCount == 0) {
            document.getElementById('loading-page').style.display = 'none'
            document.getElementById('no-instances').style.display = 'initial'
            document.getElementById('content-main-page').style.display = 'none'
          } else {
            document.getElementById('no-instances').style.display = 'none'
            document.getElementById('loading-page').style.display = 'none'
            document.getElementById('content-main-page').style.display = 'initial'
          }
        }, 500);



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

function changeInstanceClicked(instanceID) {
  localStorage.setItem('selectedInstance', instanceID)
  window.location = '/dashboard'
}

function getInstanceStocks() {
  var currentInstance = localStorage.getItem('selectedInstance')



  firebase.firestore().collection("Instances").doc(currentInstance).collection('Stocks').onSnapshot(snap => {
    document.getElementById('instance-stocks').innerHTML = ``

    snap.forEach(doc => {


      var data = doc.data();

      var tickerFormatName = data['ticker']



      if (tickerFormatName.length < 4) {
        for (var i = 0; i <= 4 - tickerFormatName.length; i++) {
          tickerFormatName = tickerFormatName + " "
        }
      }

      if (data) {
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

function createInstancePopup() {
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

function viewDetails(instance, stock){
  window.location = '/stock?ticker=' + stock
}

function createInstance() {

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

      if (key && secret) {
        //firebase.firestore().collection("Instances").doc().set({})
        error.innerHTML = ""

        var Http = new XMLHttpRequest();
        const url = 'https://intellistockapi.loca.lt/verifyCreds'
        Http.open("GET", url)
        Http.setRequestHeader('key', key)
        Http.setRequestHeader('secret', secret)
        Http.send()

        Http.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {

            var response = JSON.parse(Http.responseText)

            var message = response['message']

            var numRaw = localStorage.getItem('maxInstanceNum')

            var num = 1

            if (numRaw) {
              num = parseInt(numRaw) + 1
            }

            if (message == 'Valid') {
              firebase.firestore().collection('Instances').doc().set({
                'key': key,
                'secret': secret,
                'user': email,
                'running': false,
                'runCommand': true,
                'instanceNum': num

              }).then(() => {
                setTimeout(function () {
                  window.location.reload()
                }, 2000);

              })
            } else {
              error.innerHTML = "Alpaca credentials are invalid"
              button.innerHTML = `Create Instance`
            }
          }

        }
      } else {
        error.innerHTML = "Fields cannnot be left blank"
        button.innerHTML = `Create Instance`


      }


    } else {
      var error = document.getElementById('error-create-instance')

      error.innerHTML = "Auth error: User not signed in"
    }
  })


}

function addStockPopup() {
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

function addStock() {
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

      if (ticker && maxValue) {
        //firebase.firestore().collection("Instances").doc().set({})
        error.innerHTML = ""

        var Http = new XMLHttpRequest();
        const url = 'https://intellistockapi.loca.lt/verifyTicker'
        Http.open("GET", url)
        Http.setRequestHeader('ticker', ticker)
        Http.send()

        var currentInstance = localStorage.getItem('selectedInstance')

        Http.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {

            var response = JSON.parse(Http.responseText)

            var message = response['message']

            if (message == 'Valid') {
              firebase.firestore().collection('Instances').doc(currentInstance).collection('Stocks').doc(ticker).set({
                'currentStatus': false,
                "maxValue": maxValue.toString(),
                'run': true,
                "ticker": ticker,
                'added': getFormattedDate(new Date())

              }).then(() => {
                setTimeout(function () {
                  window.location.reload()
                }, 1000);

              })
            } else {
              error.innerHTML = "Ticker is not valid"
              button.innerHTML = `Add Stock`
            }
          }

        }
      } else {
        error.innerHTML = "Fields cannnot be left blank"
        button.innerHTML = `Create Instance`


      }


    } else {
      var error = document.getElementById('error-create-instance')

      error.innerHTML = "Auth error: User not signed in"
    }
  })

}

function removeStock(instanceID, ticker) {
  firebase.firestore().collection("Instances").doc(instanceID).collection("Stocks").doc(ticker).delete()
}


function logout() {
  firebase.auth().signOut().then(function () {
    window.location = '/'
  }).catch(function (error) {
    console.log("An error occured: " + error.toString())
  })
}




function getDashboardStats() {

  var currentInstance = localStorage.getItem('selectedInstance')

  firebase.firestore().collection("Instances").doc(currentInstance).get().then(doc => {
    var data = doc.data()

    if (data) {
      var uptime = data['uptimeStart']


      var diff = Math.abs(new Date() - new Date(uptime['seconds'] * 1000)) / 1000;//timeDiffCalc(new Date(), new Date(uptime['seconds']*1000))

      // get hours        
      var hours = Math.floor(diff / 3600) % 24;

      // get minutes
      var minutes = Math.floor(diff / 60) % 60;

      // get seconds
      var seconds = Math.round(diff % 60, 2);


      var uptimeOutput = hours + "hrs " + minutes + "m " + seconds + 's'
      document.getElementById('uptime').innerHTML = uptimeOutput
    }
  })

  var Http = new XMLHttpRequest();
  const url = `https://intellistockapi.loca.lt/getOverallData?instance=${currentInstance}`
  Http.open("GET", url)
  Http.send()

  Http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      var response = JSON.parse(Http.responseText)

      var message = response['message']

      var transactionCount = 0;
      var buyCount = 0
      var sellCount = 0

      var transactionsListsorted = []



      for (var ticker in message) {
        var data = message[ticker]

        if (data) {
          var transactions = data['transactions']

          console.log(transactions)

          if (transactions) {
            for (var i = 0; i <= transactions.length - 1; i++) {
              transactionCount += 1

              var action = transactions[i][1]

              if (action == "BUY") {
                buyCount += 1
              } else if (action == "SELL") {
                sellCount += 1
              }

              var timestamp = transactions[i][3]

              transactionsListsorted.push([timestamp, action, ticker])
              //}

            }
          }

        }
      }



      transactionsListsorted.sort(function (a, b) {
        return parseFloat(a[0]) - parseFloat(b[0]);
      });

      console.log(transactionsListsorted)

      console.log(transactionsListsorted.length)


      if (transactionsListsorted.length != 0) {
        for (var i = 0; i <= transactionsListsorted.length - 1; i++) {
          var transaction = transactionsListsorted[i]

          var transactionHTML = `
          
          <div class="latest-transactions-box">
          <center style="margin-top: 4rem;">
              <h3 style="color: white;">${transaction[2]}</h3>
          </center>

          <center style="margin-top: -10px;">
              <h5 style="color: gray;">${transaction[1]}</h5>
          </center>

          <center style="margin-top: 1rem;">
              <h4 style="color: white;">$12,111</h4>
          </center>

      </div>
          `

          if (i <= 5) {
            $(transactionHTML).appendTo('#latest-transactions-row')

          }


        }
      } else if (transactionsListsorted.length == 0) {
        document.getElementById('latest-transactions-row').innerHTML = "<h2 style = 'color: gray'>No Recent Transactions</h2>"
      }



      document.getElementById('transactions-count').innerHTML = transactionCount
      document.getElementById('buy-order-count').innerHTML = buyCount
      document.getElementById('sell-order-count').innerHTML = sellCount


    }
  }
}