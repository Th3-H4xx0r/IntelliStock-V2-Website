var endpoint = 'https://intellistockapi.loca.lt'

function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
          callback(rawFile.responseText);
      }
  }
  rawFile.send(null);
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');

  return month + '/' + day + '/' + year;
}



//usage:
readTextFile("config/config.json", function(text){
  var data = JSON.parse(text);

  endpoint = data['apiURL']
  //console.log(data);
});


function getDashboardData(instance){
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;

      console.log(instance)

      firebase.firestore().collection("Instances").doc(instance).get().then(doc => {
        var data = doc.data()

        if(data){
          if(data['user'] == email){

            console.log("WORKING")

            getInstanceData(data['key'], data['secret']);

            document.getElementById('email').innerHTML = email

            if(data['paper'] == true){
              document.getElementById('accountType').innerHTML = "Paper Trading"

            } else {
              document.getElementById('accountType').innerHTML = "Live Trading"

            }






          } else {
            toggleForbiddenPage()
          }
        } else {
          toggleForbiddenPage()

        }
      })




    } else {
      console.log("SIGNED OUT")
    }
  })
}


function getTransactionHistory(instance){

  document.getElementById('loading-page').style.display = "initial"

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;

      firebase.firestore().collection("Instances").doc(instance).get().then(snap => {
        var data = snap.data()

        if(data){

          if(data['user'] == email){

            document.getElementById('email').innerHTML = email

            var key = data['key']
            var secret = data['secret']

            var today = new Date()

            var day = today.getDate()

            var month = today.getUTCMonth()

            var year = today.getUTCFullYear();


            var Http = new XMLHttpRequest();
            const url = endpoint + `/v4/transactions?instance=${instance}&day=${day}&month=${month}&year=${year}`
            Http.open("GET", url)
            Http.setRequestHeader('key', key)
            Http.setRequestHeader('secret', secret)
            Http.setRequestHeader('content-type', "*")
            Http.setRequestHeader('Bypass-Tunnel-Reminder', "true")
            Http.send()
          
            Http.onreadystatechange = function () {
              if (this.readyState == 4 && this.status == 200) {
          
                var response = JSON.parse(Http.responseText)
          
                var message = response['message']

                if(response['status'] == 'success'){
                  console.log("success")

                  //console.log(message.length)

                  for(var i = 0; i <= message.length - 1; i++){
                    var transaction = message[i]

                    //console.log(transaction)

                    var symbol = transaction['symbol']
                    var qty = transaction['filled_qty']
                    var side = transaction['side']

                    var date = new Date(transaction['filled_at'])

                    var formattedDate = (date.getUTCMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()

                    var formattedTime = formatAMPM(date)

                    //console.log(formattedDate)

                    var badge = ``

                    if(side == 'buy'){
                      badge = 'success'
                    } else if(side == 'sell'){
                      badge = 'danger'
                    }

                    if(transaction['status'] == 'filled'){

                      var element = `
                      <tr>
                      <td class="py-1">
                          ${formattedDate}
                      </td>
                      <td> ${formattedTime} </td>
                      <td>
                          ${symbol}
                      </td>
                      <td> ${qty} </td>
                      <td> <div class="badge badge-${badge}">${side}</div></td>
                    </tr>
  
                      `
  
                      $(element).appendTo('#transactions')
                    }

                   

                    //var date = Date.parse(message['filled_at'])

                    //var formattedDate = getFormattedDate(date)

                    //console.log(formattedDate)
                  }
                }

                document.getElementById('loading-page').style.display = "none"
                document.getElementById('content-main-page').style.display = "initial"


                //console.log(response)

              }
            }

          } else {
            toggleForbiddenPage()

          }
        } else {
          toggleForbiddenPage()
        }
      })




    }
  })
}

function getWatchlistData(instance){

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;

      console.log(instance)

      firebase.firestore().collection("Instances").doc(instance).get().then(doc => {
        var data = doc.data()

        if(data){
          if(data['user'] == email){

            document.getElementById('email').innerHTML = email

            getInstanceStocks(instance);

            //document.getElementById('no-instances').style.display = 'none'



          } else {
            toggleForbiddenPage()
          }
        } else {
          toggleForbiddenPage()

        }
      })




    }
  })
}

function getInstanceStocks(instance){

  
  firebase.firestore().collection("Instances").doc(instance).collection("Stocks").onSnapshot(docs => {
    document.getElementById('watchlist').innerHTML = ''

    var count = 0;

    docs.forEach(doc => {
      var data = doc.data()

      if(data){

        count++

        var statusLogo = ``

        var connected = data['connected']

        var currentStatus = data['currentStatus']

        var run = data['run']

        if(connected == true && currentStatus == true && run == true){
          statusLogo = `<i class="fas fa-cloud" style="color: #00cf98"></i>`
        } else if(connected == false && currentStatus == false && run == false){
          statusLogo = `<i class="fas fa-cloud" style="color: #d9515d"></i>`
        } else {
          statusLogo = `<i class="fas fa-cloud" style="color: #d09e20"></i>`

        }

        var tickerHTML = `

        <div class="col-xl-3 col-sm-6 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-9">
                <div class="d-flex align-items-center align-self-start">
                  <h3 class="mb-0">${data['ticker']}</h3>
                </div>
              </div>
            </div>
            <h6 class="text-muted font-weight-normal" id = 'accountType'>${data['companyName']}</h6>


            <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
              <h5 class="text-muted font-weight-normal" >Max Equity</h5>

              <h5 class="text-muted font-weight-normal" >$${data['maxValue']}</h5>

            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
              <h5 class="text-muted font-weight-normal" >Type</h5>

              <h5 class="text-muted font-weight-normal" >${data['tradingMode']}</h5>

            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
              <h5 class="text-muted font-weight-normal" >Strategy</h5>

              <h5 class="text-muted font-weight-normal" >${data['algorithm']}</h5>

            </div>

            <div style="float: right; margin-left: 1rem; margin-top: 2rem; margin-bottom: -0.5rem;">
              <button class="removeBtn" onclick = "removeStockPopup('${instance}', '${data['ticker']}')">Remove</button>
              <button class="viewBtn" style="margin-left: 1rem;">View</button>
            </div>
          </div>
        </div>
      </div>



        `

        $(tickerHTML).appendTo('#watchlist');

      }
    })

    if(count == 0){
      document.getElementById('no-stocks-page').style.display = "initial"
      document.getElementById('initial-stocks-page').style.display = "none"

    } else {
      document.getElementById('initial-stocks-page').style.display = "initial"
    }

    //document.getElementById('watchlist-item-count').innerHTML = `${count}`
  })
  document.getElementById('loading-page').style.display = "none"
  document.getElementById('content-main-page').style.display = "initial"

}


function getInstanceData(key, secret){

  var Http = new XMLHttpRequest();
  const url = endpoint + '/v1/dashboardData'
  Http.open("GET", url)
  Http.setRequestHeader('key', key)
  Http.setRequestHeader('secret', secret)
  Http.setRequestHeader('content-type', "*")
  Http.setRequestHeader('Bypass-Tunnel-Reminder', "true")
  Http.send()

  Http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      var response = JSON.parse(Http.responseText)

      var message = response['message']

      console.log(message)

      var accountData = message['account']

      var positions = message['positions']

      var balance = message['balanceHistory']

      var equity = accountData['equity']

      var buyingPower = accountData['buying_power']

      var equityChange = accountData['equity'] - accountData['last_equity']

      var transactions = message['recentTransactions']



      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    if(equityChange >= 0){

      document.getElementById('equity-change-box-symbol').innerHTML = `
        <div class="icon icon-box-success">
          <span class="mdi mdi-arrow-top-right icon-item"></span>
        </div>
      `

      //document.getElementById('equity-change-text').innerHTML = `<p class="text-success ml-2 mb-0 font-weight-medium" id = 'equityChange'>-$0</p>`

      //document.getElementById('equityChange').innerHTML = "+$" + numberWithCommas(equityChange.toFixed(2))
      document.getElementById('today-return').innerHTML = "+$" + numberWithCommas(equityChange.toFixed(2))
      document.getElementById('today-return').className = "text-success"

      document.getElementById('today-return-box-symbol').innerHTML = `
      <div class="icon icon-box-success">
        <span class="mdi mdi-arrow-top-right icon-item"></span>
      </div>
    `


    } else if(equityChange < 0){

      //document.getElementById('equity-change-text').innerHTML = `<p class="text-danger ml-2 mb-0 font-weight-medium" id = 'equityChange'>-$0</p>`

      document.getElementById('equity-change-box-symbol').innerHTML = `
      <div class="icon icon-box-danger">
        <span class="mdi mdi-arrow-bottom-left icon-item"></span>
      </div>
    `

    document.getElementById('today-return-box-symbol').innerHTML = `
    <div class="icon icon-box-danger">
      <span class="mdi mdi-arrow-bottom-left icon-item"></span>
    </div>
  `

      //document.getElementById('equityChange').innerHTML = "-$" + numberWithCommas((equityChange * -1).toFixed(2))
      document.getElementById('today-return').innerHTML = "-$" + numberWithCommas((equityChange * -1).toFixed(2))
      document.getElementById('today-return').className = "text-danger"


    }


    for(var x = 0; x <= transactions.length - 1; x++){
      var transaction = transactions[x]

      var ticker = transaction['symbol']
      var side = transaction['side']
      var qty = transaction['qty']

      var sideText = ''
      
      var sideColor = ''

      if(side == 'sell'){
        sideText = `Sell ${qty} shares`
        sideColor = 'danger'
      } else if(side == 'buy'){
        sideText = `Buy ${qty} shares`
        sideColor = 'success'
      }

      var date = new Date(transaction['filled_at'])

      var formattedDate = (date.getUTCMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()

      var formattedTime = formatAMPM(date)




      var transactionHTML = `

      <div class="preview-item border-bottom">
      <div class="preview-thumbnail">
        <div class="preview-icon bg-${sideColor}">
          <i class="mdi mdi-cart"></i>
        </div>
      </div>
      <div class="preview-item-content d-sm-flex flex-grow">
        <div class="flex-grow">
          <h6 class="preview-subject">${ticker}</h6>
          <p class="text-muted mb-0">${sideText}</p>
        </div>
        <div class="mr-auto text-sm-right pt-2 pt-sm-0">
          <p class="text-muted">${formattedTime}</p>
          <p class="text-muted mb-0">${formattedDate}</p>
        </div>
      </div>
    </div>

      `

      $(transactionHTML).appendTo('#transactionsList')
    }



      document.getElementById('buyingPower').innerHTML = "$" + numberWithCommas(buyingPower)

      document.getElementById('equity').innerHTML = "$" + numberWithCommas(equity)

      var positionsPercent = {}

      
      var positionLabels = []

      var positionValues = []


      if(positions.length == 0){

        var noPositionsHTML = `
        <div class="d-flex justify-content-center">

          <h5 margin-top: 1rem">No Positions</h5>

        </div>
        `
        document.getElementById('watchlist-list').innerHTML = noPositionsHTML
      } else {

        var positionIndex = 0;

        for(i in positions){
          positionIndex += 1

          var position = positions[i]
          console.log(position)
  
          var quantity = position['qty']
          var symbol = position['symbol']

          positionLabels.push(position['symbol'])
          positionValues.push(position['market_value'])
  
          var totalReturn = parseFloat(position['unrealized_pl'])

          var returnText = ''

          var returnColor = '#00cf98'

          if(totalReturn < 0){
            returnColor = '#d9515d'
            returnText = '-$' + (totalReturn * -1)
          } else if(totalReturn > 0){
            returnColor = '#00cf98'
            returnText = '+$' + totalReturn
          } else {
            returnText = '$' + (totalReturn * -1)
          }


          console.log(returnText)

          var positionHTML = `

          <tr>
            <td>
                <h5 style="color: white;">${positionIndex}</h5>
            </td>
            <td>
              <span class="pl-2">${symbol}</span>
            </td>
            <td> ${quantity} </td>
            <td style= 'color: ${returnColor};'>${returnText}</td>
        </tr>


            /*

            <div class="watchlist-item">

            <div class="row">
                <span>${positionIndex}</span>
  
                <span style="margin-left: 5rem;">${symbol}</span>
  
                <span style="margin-left: 4.5rem;">${quantity}</span>
  
                <span style="color: ${returnColor}; font-weight: bold">${returnText}</span>
            </div>
  
        </div>

        */


          `

          $(positionHTML).appendTo('#watchlist-list');
  
  
        }
      }

  
      if ($("#portfolio-diversity").length) {
        var areaData = {
          labels: positionLabels,
          datasets: [{
              data: positionValues,
              backgroundColor: [
                "#00d25b","#434860","#f3be62", "#90cbed"
              ]
            }
          ]
        };
        var areaOptions = {
          responsive: true,
          maintainAspectRatio: true,
          segmentShowStroke: false,
          cutoutPercentage: 75,
          elements: {
            arc: {
                borderWidth: 0
            }
          },      
          legend: {
            display: false
          },
          tooltips: {
            enabled: true
          }
        }
  
        var transactionhistoryChartPlugins = {
          beforeDraw: function(chart) {
            var width = chart.chart.width,
                height = chart.chart.height,
                ctx = chart.chart.ctx;
        
            ctx.restore();
            var fontSize = 1;
            ctx.font = fontSize + "rem sans-serif";
            ctx.textAlign = 'left';
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
        
            var text =  "$" + numberWithCommas(accountData['equity']), 
                textX = Math.round((width - ctx.measureText(text).width) / 2),
                textY = height / 2.4;
        
            ctx.fillText(text, textX, textY);
  
            ctx.restore();
            var fontSize = 0.75;
            ctx.font = fontSize + "rem sans-serif";
            ctx.textAlign = 'left';
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#6c7293";
  
            var texts = "Total", 
                textsX = Math.round((width - ctx.measureText(text).width) / 1.93),
                textsY = height / 1.7;
        
            ctx.fillText(texts, textsX, textsY);
            ctx.save();
          }
        }
        var transactionhistoryChartCanvas = $("#portfolio-diversity").get(0).getContext("2d");
        var transactionhistoryChart = new Chart(transactionhistoryChartCanvas, {
          type: 'doughnut',
          data: areaData,
          options: areaOptions,
          plugins: transactionhistoryChartPlugins
        });
      }



      var points = []

      var prices = []

      var timestamps = []

      var pricesNotNAN = []



      for (var i = 0; i <= balance['equity'].length; i++) {
        if (balance['equity'][i] != null && balance['timestamp'][i] != null) {
          pricesNotNAN.push(balance['equity'][i])
        }
          prices.push(balance['equity'][i])
          timestamps.push(balance['timestamp'][i])
          points.push({ date: new Date(balance['timestamp'][i] * 1000), value: balance['equity'][i] })
        //}

      }



      var todayReturn = 0

      todayReturn = pricesNotNAN[pricesNotNAN.length - 1] - pricesNotNAN[0]

      console.log(todayReturn)

      var displayPrice = ""

      if(todayReturn >= 0){
        displayPrice = `<span style = "color: #00cf98; font-weight: bold">+$${todayReturn.toFixed(2)}</span>`
      } else if(todayReturn < 0){
        displayPrice = `<span style = "color: #d9515d; font-weight: bold">-$${(todayReturn * -1).toFixed(2)}</span>` 
      }

      //document.getElementById('portfolio-statement').innerHTML = `As of today ${formatAMPM(new Date())}. Today's P&L ${displayPrice}`


      /*

      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);


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
        return series;
      }

      createSeries("value", "Portfolio", points, 'price');


      //chart.legend = new am4charts.Legend();
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

*/
    


 // Set new default font family and font color to mimic Bootstrap's default styling
//Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
//Chart.defaults.global.defaultFontColor = '#858796';


var data = {
  //labels: ["6:00", "2014", "2014", "2015", "2016", "2017"],

  labels: timestamps,
  datasets: [{ 
      data: prices,
      borderColor: "#00cf98",
      fill: false,
      pointRadius: 0
  }
  ]

};

var options = {
  scales: {
    yAxes: [{
      ticks: {  
        beginAtZero: false,

        stepSize: equity/10
      },
      gridLines: {
        color: "rgba(204, 204, 204,0.1)"
      }
    }],
    xAxes: [{
      gridLines: {
        display: false,
      }, 

      ticks: {
        display: false
      }

    }]
  },
  legend: {
    display: false
  },
  elements: {
    point: {
      radius: 0
    }
  }
};


if ($("#myChart").length) {
  var lineChartCanvas = $("#myChart").get(0).getContext("2d");
  var lineChart = new Chart(lineChartCanvas, {
    type: 'line',
    data: data,
    options: options
  });
}


/*
// Area Chart Example
var ctx = document.getElementById("myChart").getContext('2d');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: timestamps,
    datasets: [{ 
        data: prices,
        borderColor: "#00cf98",
        fill: false,
        pointRadius: 0
    }
    ]
  },
  options: {
    responsive: false,
    scales: {
        xAxes: [{
            ticks: {
                display: false //this will remove only the label
            },
            gridLines: {
              display: false,
              drawBorder: false,
            },
        }],

        yAxes: [{
          ticks: {
              display: true //this will remove only the label
          },
          gridLines: {
            color: '#394364'
          },
      }]
    },
    title: {
      display: false
    },
    legend:{
      display: false
    }
}

});

*/

  document.getElementById('loading-page').style.display = 'none'
  document.getElementById('content-main-page').style.display = 'initial'



    }
  }


      //console.log(balance['equity'][0])

      //console.log(balance['equity'].slice(-1)[0] )

      //var totalReturn = balance['equity'][0] - balance['equity'][balance['equity'].length - 1]

      //document.getElementById('return').innerHTML = "$" + totalReturn





}

function closeDiscoverModal(){
  var checked = document.getElementById('dontShow').checked

  print(checked)
}

function showDiscoverPagePopup(){
  var modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="discoverPageModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header" style = 'background-color: #272727; color: white'>
        <h5 class="modal-title" id="exampleModalLabel">New update!</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style = 'background-color: #272727; color: white'>

      <h3>Introducing IntelliStock Explore!</h4>

      <h5 style = 'font-weight: 400; color: grey'>Introducing a new addition to intellistock, intellistock explore! <br><br> With explore, you can discover new stocks that have shown promising growth over a period of time,
      prefect for long term investments. <br><br> Using a complex algoritm, intellistock screens thousands of stocks that are avaliable in the global stock exchanges to find the top picks for you to explore!
       <br><br> This list is updated every 24 hours so you can find new and different stocks everyday! <br><br> Get started browsing some today!</h5>

      </div>
      <div class="modal-footer" style = 'background-color: #272727; color: white'>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
  `

  $(modalHTML).appendTo('#page-main')

  $('#discoverPageModal').modal('toggle')
}

function getDiscoverPageData(){

  var showModal = localStorage.getItem('showDiscoverStocksModal')

  if(showModal == null){
    showDiscoverPagePopup()
  }

  firebase.auth().onAuthStateChanged(user => {
    if (user) {

      var email = user.email

      document.getElementById('email').innerHTML = email


      var Http = new XMLHttpRequest();
      const url = endpoint + '/discoverStocks'
      Http.open("GET", url)
      Http.setRequestHeader('content-type', "*")
      Http.send()
    
      Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
    
          var response = JSON.parse(Http.responseText)
    
          var message = response['message']

          var status = response['status']

          if(status == 'success'){

            firebase.firestore().collection('Config').doc('Cache').get().then(snap => {
              var data = snap.data();

              if(data != null){
                var lastTime = data['discoverLastUpdate']

                var date = new Date(lastTime.seconds)

                console.log(lastTime.seconds)

                document.getElementById('timeStatement').innerHTML = "Generated as of " + formatAMPM(date)
              }
            }).then(() => {


              message.sort(function(a, b){return b['rating']-a['rating']});

              for(var i = 0; i <= message.length - 1; i++){

                var element = message[i]

                var html = `
                  <tr>
                      <td class="py-1">
                          ${element['ticker']}
                      </td>
                      <td> ${element['rating']} </td>
                      <td>
                          ${element['50dMA']}
                      </td>
                      <td> ${element['52WHigh']} </td>
                      <td> ${element['52wLow']}</td>
                    </tr>
  
                `

                $(html).appendTo('#discoverStocks');
              }
            })
            console.log(message)
          }
        }

    } 
  } else {
      console.log("Auth error")
    }
  })
}

function toggleForbiddenPage(){
  document.getElementById('forbidden-page').style.display = 'initial'

  document.getElementById('loading-page').style.display = 'none'
  //document.getElementById('no-instances').style.display = 'none'
}

function getInstances(){
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;

      firebase.firestore().collection("Instances").where('user',  '==', email).onSnapshot(docs => {

        $('#instances-container').html('')

        var instancesList = []

        var instanceCount = 0

        docs.forEach(doc => {
          //instancesList.append(value)
          instanceCount += 1

          var data = doc.data()

          console.log(data)

          var instanceType = "Paper Trading"

          if(data['paper'] == false){
            instanceType = 'Live Trading'
          }

          var statusSymbol = ``

          var isOn = 'checked'

          if(data['running'] == false && data['runCommand'] == false){
            isOn = ''
            statusSymbol = `
            <span class="status-badge-off">○ Stopped</span>            `
          } else if(data['running'] == true && data['runCommand'] == true){
            statusSymbol = `
            <span class="status-badge-on">○ Running</span>
            `
            isOn = 'checked'
          } else {
            statusSymbol = `

            <span class="status-badge-waiting">○ Loading</span>
         
            `
          }

          var uptimeOutput = 'Stopped'

          if(data['running'] == true){
            var uptime = data['uptimeStart']

            var uptimeDate = new Date(uptime['seconds'] * 1000)


            uptimeDate.setHours(uptimeDate.getHours() + 8)


            var diffDate = new Date() - uptimeDate


            


            var diff = Math.abs(diffDate) / 1000;//timeDiffCalc(new Date(), new Date(uptime['seconds']*1000))

            //diff.setHours(diff.getHours() - 8)
  
            // get hours        
            var hours = Math.floor(diff / 3600) % 24;
  
            // get minutes
            var minutes = Math.floor(diff / 60) % 60;
  
            // get seconds
            var seconds = Math.round(diff % 60, 2);
  
  
            var uptimeOutput = hours + "hrs " + minutes + "m " + seconds + 's'
  
          }

         


          var instanceHTML = `


          <div class="instance-item" style = 'margin-top: 1rem'>
              <div style = ' display: flex; justify-content: space-between;'>
              <h4 style="color: white; font-weight: bold; font-family: Nunito; margin-top: 1rem; margin-left: 1rem; font-size: 20px;">${data['instanceName']}</h4>
  
              ${statusSymbol}
          
          </div>
  
  
          <div style = ' display: flex; justify-content: space-between; margin-top: 2rem; margin-bottom: 0.5rem;'>
              <div class="row">
                  <i class="far fa-clock" style="color: white; margin-left: 2rem; font-size: 20px; margin-right: 0.5rem; margin-top: 0.1rem;"></i>
  
                  <h6 style = 'color: white'>Uptime</h6>
              </div>
  
              <div style="color: #B5B5B5; margin-right: 1rem;">${uptimeOutput}</div>
          </div>
  
          <div class="divider"></div>
  
          <div style = ' display: flex; justify-content: space-between; margin-top: 2rem; margin-bottom: 0.5rem;'>
              <div class="row">
                  <i class="fas fa-chart-line" style="color: white; margin-left: 2rem; font-size: 20px; margin-right: 0.5rem; margin-top: 0.1rem;"></i>
  
                  <h6 style = 'color: white'>Type</h6>
              </div>
  
              <div style="color: #B5B5B5; margin-right: 1rem;">${instanceType}</div>
          </div>
  
          <div class="divider"></div>
  
          <div style = ' display: flex; justify-content: space-between; margin-top: 2rem; margin-bottom: 1rem;'>
  
              <a style = 'color: #AEAEAE; margin-left: 1rem; font-weight: bold;' href="/dashboard?instance=${doc.id}">View Instance</a>
  
              <!-- Rounded switch -->
              <label class="switch" style="margin-right: 1rem;">
                  <input type="checkbox" ${isOn} onclick="changeInstanceState('${doc.id}', ${!data['runCommand']})">
                  <span class="slider round"></span>
              </label>
          </div>
  
  
          </div>


          `

          $(instanceHTML).appendTo('#instances-container')
        })

        if(instanceCount == 0){
          document.getElementById('no-instances').style.display = 'initial'
          document.getElementById('content-main-page').style.display = 'none'

        } else {
          document.getElementById('no-instances').style.display = 'none'
          document.getElementById('content-main-page').style.display = 'initial'
        }

      })

      document.getElementById('loading-page').style.display = 'none'


    }
  })
}

function changInstanceState(instance, state){
  firebase.firestore().collection('Instances').doc(instance).update({
    'runCommand': state
  })
}


function getAccountHistory(key, secret) {
  var Http = new XMLHttpRequest();
  const url = endpoint + '/getBalance'
  Http.open("GET", url)
  Http.setRequestHeader('key', key)
  Http.setRequestHeader('secret', secret)
  Http.setRequestHeader('content-type', "*")
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
          points.push({ date: new Date(rawTimes[i] * 1000), value: values[i] })
        }

      }

      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);


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
        return series;
      }

      createSeries("value", "Portfolio", points, 'price');


      //chart.legend = new am4charts.Legend();
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
                  scales: {
                      xAxes: [{
                          type: 'time',
                          time: {
                              unit: 'hour'
                          }
                      }]
                  }
      */

      /*

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
      */
    }
  }


}

function getStockGraph(instance, stock) {

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  var Http = new XMLHttpRequest();
  const url = endpoint + `/v3/graphData?instance=${instance}&day=${day}&month=${month}&year=${year}`
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

      document.getElementById('maxprice').innerHTML = "$" + max.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      document.getElementById('minprice').innerHTML = "$" + min.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

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

//DEPRICATED OLD FUNCTION
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
              } else if(pageType == 'settings'){
                getDataSettingsPage()
              }



              if (instanceStatus == false) {
                document.getElementById('server-icon-status').innerHTML = `<img src = 'Assets/center_SERVER_ICON_red.png'  style="margin-top: 3rem;" />`
                if(document.getElementById('server-change-status-btn')){
                  document.getElementById('server-change-status-btn').innerHTML = `<button class = 'start-instance-btn' onclick = 'changeInstanceState("${doc.id}", ${true})'>Start</button>`
                }
              } else if (instanceStatus == true) {
                document.getElementById('server-icon-status').innerHTML = `<img src = 'Assets/center_server_cion_green.png'  style="margin-top: 3rem;" />`
                if(document.getElementById('server-change-status-btn')){
                  document.getElementById('server-change-status-btn').innerHTML = `<button class = 'stop-instance-btn'  onclick = 'changeInstanceState("${doc.id}", ${false})'>Stop</button>`
                }

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
              } else if(pageType == 'settings'){
                getDataSettingsPage()
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

//DEPRICATED OLD FUNCTION

function changeInstanceState(id, command){
  console.log("CHANING : " + id + " to " + command)
  firebase.firestore().collection("Instances").doc(id).update({
    'runCommand': command
  })
}

//DEPRICATED OLD FUNCTION
function changeInstanceClicked(instanceID) {
  localStorage.setItem('selectedInstance', instanceID)
  window.location = '/dashboard'
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

<input type="radio" id="webull" name="webull" value="webull" class = 'fromcheck'disabled>
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

      var instanceName = document.getElementById('instance-name').value

      button.innerHTML = `<div class="lds-dual-ring"></div>`

      //console.log(key)
      //console.log(secret)

      if (key && secret && instanceName) {

        //firebase.firestore().collection("Instances").doc().set({})
        error.innerHTML = ""

        var Http = new XMLHttpRequest();
        const url = endpoint + '/verifyCreds'
        Http.open("GET", url)
        Http.setRequestHeader('key', key)
        Http.setRequestHeader('secret', secret)
        Http.setRequestHeader('Bypass-Tunnel-Reminder', true)
        Http.setRequestHeader('Access-Control-Allow-Origin', "*")
        Http.send()

        Http.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {

            var response = JSON.parse(Http.responseText)

            var message = response['message']

            //var numRaw = localStorage.getItem('maxInstanceNum')

            //var num = 1

            //if (numRaw) {
              //num = parseInt(numRaw) + 1
            //}

            if (message == 'Valid') {

              document.getElementById('loading-instance-page').style.display = "initial"
              document.getElementById('create-section').style.display = "none"

         

              firebase.firestore().collection('Instances').doc().set({
                'key': key,
                'secret': secret,
                'user': email,
                'running': false,
                'runCommand': true,
                'instanceName': instanceName,
                "paper": true

              }).then(() => {

                setTimeout(function(){ 

              
                  var terminalHTML = `
                  <div id="termynal" style = 'margin: 2rem; height: 30rem' data-termynal>
                  <span data-ty="input">instance -create --broker alpaca</span>
                  <span data-ty data-ty-delay="250">[SERVER] Checking credentials...</span>
                  <span data-ty data-ty-delay="1050">[Alpaca Broker] Valid</span>
    
                  <span data-ty data-ty-delay="250">[SERVER] Creating instance...</span>
                  <span data-ty data-ty-delay="3250">[SERVER] Initializing instance variables...</span>
    
                  <span data-ty data-ty-delay="3250">[SERVER] Launching instanceBroker.exe --flags alpaca</span>
    
                  <span data-ty data-ty-delay="2250">[SERVER] instanceBroker.exe closed with exit code 0</span>
    
    
                  <span data-ty data-ty-delay="3250">[SERVER] Instance Created! Starting instance...</span>
    
                  <span data-ty data-ty-delay="1250">Instance is online! <a href = '/instances'>Click to go to instances</a></span>
    
    
                </div>
                  `
    
                  document.getElementById('loading-instance-page').innerHTML = terminalHTML
    
                  var termynal = new Termynal('#termynal', { startDelay: 600 })
    
                  }, 3000);
                

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

function addStockPopup(instance) {
  var modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="addStockModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
  <div class="modal-dialog" role="document" >
    <div class="modal-content" >
      <div class="modal-header" style = 'background-color: #272727; color: white'>
        <h5 class="modal-title" id="exampleModalLabel" style = 'font-family: Nunito; font-weight: bold'>Add Stock</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" style = 'color: white'>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style = 'background-color: #272727; color: white'>

      <h6 style = 'font-family: Nunito; font-weight: bold'>Watch Type</h6>

      <div class="form-check">
      <label class="form-check-label">
        <input type="radio" class="form-check-input" id="webull" name="webull" value="webull" disabled=""> Long Term (Coming Soon) <i class="input-helper"></i></label>
      </div>

      <div class="form-check">
      <label class="form-check-label">
        <input type="radio" class="form-check-input" id="webull" name="webull" value="webull" disabled=""> Short Term (Coming Soon) <i class="input-helper"></i></label>
      </div>

      <div class="form-check">
        <label class="form-check-label">
          <input type="radio" class="form-check-input" name="optionsRadios" id="optionsRadios1" value="" checked = ""> Day Trade <i class="input-helper"></i></label>
      </div>


          <div class="form-group">
            <label for="recipient-name" class="col-form-label" style= 'font-family: Nunito; font-weight: bold'>Ticker</label>
            <input type="text" class="form-control" id="tickerInput" style = 'background-color: #272727; color: white; border: 2px solid #00CF98'>
          </div>

          
      <h6 style = 'font-family: Nunito; font-weight: bold'>Algorithm</h6>

      <div class="form-check">
      <label class="form-check-label">
        <input type="radio" class="form-check-input" id="webull" name="webull" value="webull" disabled=""> RSI (Coming Soon) <i class="input-helper"></i></label>
      </div>

      <div class="form-check">
        <label class="form-check-label">
          <input type="radio" class="form-check-input" name="macd" id="macd" value="" checked = ""> MACD <i class="input-helper"></i></label>
      </div>


          <div class="form-group">
            <label for="message-text" class="col-form-label"  style= 'font-family: Nunito; font-weight: bold'>Max Equity Value</label>
            <input type="number" class="form-control" id="maxValue" style = 'background-color: #272727; color: white; border: 2px solid #00CF98'>
          </div>


        <p id = 'error-add-stock' style = "color: red"></p>
      </div>
      <div class="modal-footer" style = 'background-color: #313033; color: white; height: 4rem;'>
        <button type="button" class="close-btn" data-dismiss="modal" style = 'margin-bottom: 1.5rem'>Close</button>
        <div class="d-flex justify-content-center" style="margin-bottom: 0rem;">
        <button class="create-btn" id = 'add-stock-btn' onclick="addStock('${instance}')" style = 'margin-bottom: 1.5rem'>Add Stock</button>
    </div>
      </div>
    </div>
  </div>
</div>
  `

  $(modalHTML).appendTo('#page-main')

  $('#addStockModal').modal('toggle')


}



function addStock(currentInstance) {
  
  var ticker = document.getElementById('tickerInput').value
  var maxValue = document.getElementById('maxValue').value
  var error = document.getElementById('error-add-stock')

  var button = document.getElementById('add-stock-btn')

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var email = user.email;



      button.innerHTML = `Adding stock...`

      //console.log(key)
      //console.log(secret)

      if (ticker && maxValue) {
        var error = document.getElementById('error-add-stock')

        //firebase.firestore().collection("Instances").doc().set({})
        error.innerHTML = ""

        var Http = new XMLHttpRequest();
        const url = endpoint + '/verifyTicker'
        Http.open("GET", url)
        Http.setRequestHeader('ticker', ticker)
        Http.send()

        Http.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {

            var response = JSON.parse(Http.responseText)

            var message = response['message']

            if (message == 'Valid') {

              var url = endpoint + '/tickerInfo?ticker=' + ticker

              $.get(url, function(companyData){
                console.log(companyData)
                console.log(companyData['message'][0]['longName'])

                firebase.firestore().collection('Instances').doc(currentInstance).collection('Stocks').doc(ticker).get().then(doc => {
                  var data = doc.data()

                  console.log(data)

                  if(data == undefined){

                    if(companyData['status'] == "success" && companyData['message'] != undefined && companyData['message'] != {}){
                      firebase.firestore().collection('Instances').doc(currentInstance).collection('Stocks').doc(ticker).set({
                        'currentStatus': false,
                        "maxValue": maxValue.toString(),
                        'run': true,
                        "ticker": ticker,
                        'companyName': companyData['message'][0]['longName'],
                        'algorithm': "MACD",
                        'tradingMode': "Day Trade",
                        'added': getFormattedDate(new Date())
        
                      }).then(() => {
                        setTimeout(function () {
                          window.location.reload()
                        }, 1000);
        
                      })
                    } else {
                      var error = document.getElementById('error-add-stock')


                      error.innerHTML = "Internal server error"
                      button.innerHTML = `Add Stock`
                    }

                  } else {
                    var error = document.getElementById('error-add-stock')


                    error.innerHTML = "Already watching stock"
                    button.innerHTML = `Add Stock`
                  }
                })


              })

              /*

              */
            } else {

              var error = document.getElementById('error-add-stock')


              error.innerHTML = "Ticker is not valid"
              button.innerHTML = `Add Stock`
            }
          }

        }
      } else {

        var error = document.getElementById('error-add-stock')


        error.innerHTML = "Fields cannnot be left blank"
        button.innerHTML = `Create Instance`


      }


    } else {
      var error = document.getElementById('error-add-stock')

      error.innerHTML = "Auth error: User not signed in"
    }
  })

}

function removeStockPopup(instanceID, ticker) {
  var modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="deleteInstanceModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header" style = 'background-color: #272727; color: white'>
        <h5 class="modal-title" id="exampleModalLabel">Remove ${ticker}?</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style = 'background-color: #272727; color: white'>

      <p>Are you sure you want to remove ${ticker} from your watchlist? Doing this will make the bot stop watching this stock and making any related trades.</p>

        <p id = 'remove-stock-error' style = "color: red"></p>
      </div>
      <div class="modal-footer" style = 'background-color: #272727; color: white'>
        <button type="button" class="close-btn" data-dismiss="modal">Close</button>
        <div class="d-flex justify-content-center" style="margin-top: 1rem;">
        <button class="delete-btn" id = 'delete-btn-modal' onclick="removeStock('${instanceID}', '${ticker}')">Remove Stock</button>
    </div>
      </div>
    </div>
  </div>
</div>
  `

  $(modalHTML).appendTo('#page-main')

  $('#deleteInstanceModal').modal('toggle')


}



function removeStock(instanceID, ticker) {

  var button = document.getElementById('delete-btn-modal')

  button.innerHTML = `Removing stock...`

  firebase.firestore().collection("Instances").doc(instanceID).collection("Stocks").doc(ticker).update({
    'run': false,
  }).then(() => {
    setTimeout(function(){
      firebase.firestore().collection("Instances").doc(instanceID).collection("Stocks").doc(ticker).delete().then(() => {
        window.location.reload()
      })
     }, 3000);

  })

}


function logout() {
  firebase.auth().signOut().then(function () {
    window.location = '/'
  }).catch(function (error) {
    console.log("An error occured: " + error.toString())
  })
}



// DEPRICATED FUNCTION OLD
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

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  var Http = new XMLHttpRequest();
  const url = endpoint + `/v3/graphData?instance=${currentInstance}&day=${day}&month=${month}&year=${year}`
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

              transactionsListsorted.push([timestamp, action, ticker, transactions[i][2], transactions[i][4]])
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

          var totalCost = (transaction[3] * transaction[4]).toFixed(2)

          var sign = "+"

          if(transaction[1] == "SELL"){
            sign = "-"
          }


          var transactionHTML = `
          
          <div class="latest-transactions-box">
          <center style="margin-top: 4rem;">
              <h3 style="color: white;">${transaction[2]}</h3>
          </center>

          <center style="margin-top: -10px;">
              <h5 style="color: gray;">${transaction[1]}</h5>
          </center>

          <center style="margin-top: 1rem;">
              <h5 style="color: white;">${sign} $${totalCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h5>
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

function getDataSettingsPage(instance){
  document.getElementById('loading-page').style.display = 'initial'

  firebase.auth().onAuthStateChanged(user => {
    if (user) {

      var email = user.email;


      var keyInput = document.getElementById('alpaca-key')
      var secretInput = document.getElementById('alpaca-secret')
      var instanceName = document.getElementById('instanceName')

      firebase.firestore().collection('Instances').doc(instance).get().then(doc => {
        var data = doc.data()

        if(data && data['user'] == email){
          var key = data['key']
          var secret = data['secret']

          document.getElementById('email').innerHTML = email

          keyInput.value = key
          secretInput.value = secret
          instanceName.value = data['instanceName']

          var deleteBtnHTML = `
          <button class="btn btn-danger mr-2" style="margin-top: 3rem;" id = 'delete-btn' onclick="deleteInstancePopup('${instance}')" >Delete Instance</button>
          `
  
          $(deleteBtnHTML).appendTo('#more');

          document.getElementById('loading-page').style.display = 'none'
          document.getElementById('content-main-page').style.display = 'initial'


        } else {
          toggleForbiddenPage()
        }

      })


      //console.log(key)
      //console.log(secret)

    } else {
      toggleForbiddenPage()
    }
  })
}

function updateInstanceName(instance){
  var button = document.getElementById('update-instance-name-btn')
  var error = document.getElementById('update-name-error')


  button.disabled = true
  button.innerHTML = 'Updating...'

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;


      var name = document.getElementById('instanceName').value


      if(name){

        firebase.firestore().collection("Instances").doc(instance).update({
          "instanceName": name
        }).then(() => {
          window.location.reload()
        })

      } else {
        error.innerHTML = "Invalid input"
      }

      

    } else {

    }
  })


}

function updateCredentials(currentInstance){
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      var name = user.displayName;
      var pic = user.photoURL;
      var email = user.email;


      var key = document.getElementById('alpaca-key').value
      var secret = document.getElementById('alpaca-secret').value

      var error = document.getElementById('error-create-instance')

      var button = document.getElementById('updateCreds-btn')


      button.innerHTML = `Updating...`
      button.disabled = true

      //console.log(key)
      //console.log(secret)

      if (key && secret) {
        //firebase.firestore().collection("Instances").doc().set({})
        error.innerHTML = ""

        var Http = new XMLHttpRequest();
        const url = endpoint + '/verifyCreds'
        Http.open("GET", url)
        Http.setRequestHeader('key', key)
        Http.setRequestHeader('secret', secret)
        Http.send()

        Http.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {

            var response = JSON.parse(Http.responseText)

            var message = response['message']

            if (message == 'Valid') {
              
              firebase.firestore().collection('Instances').doc(currentInstance).update({
                'key': key,
                'secret': secret,
                'runCommand': true,

              }).then(() => {
                setTimeout(function () {
                  window.location.reload()
                }, 1000);

              })

              console.log("VALID")
            } else {
              error.innerHTML = "Alpaca credentials are invalid"
              button.innerHTML = `Update Credentials`
              button.disabled = false

            }
          }

        }
      } else {
        error.innerHTML = "Fields cannnot be left blank"
        button.innerHTML = `Update Credentials`
        button.disabled = false


      }


    } else {
      var error = document.getElementById('error-create-instance')

      error.innerHTML = "Auth error: User not signed in"
    }
  })

}

function deleteInstancePopup(instanceID) {
  var modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="deleteInstanceModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header" style = 'background-color: #272727; color: white'>
        <h5 class="modal-title" id="exampleModalLabel">Delete Instance?</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style = 'background-color: #272727; color: white'>

      <p>Are you sure you want to delete this instance? This action is non-reversable!</p>

        <p id = 'delete-instance-error' style = "color: red"></p>
      </div>
      <div class="modal-footer" style = 'background-color: #272727; color: white'>
        <button type="button" class="btn btn-inverse-light" data-dismiss="modal">Close</button>
        <div class="d-flex justify-content-center" style="margin-top: 0.2rem;">
        <button class="btn btn-danger" id = 'delete-btn-modal' onclick="deleteInstance('${instanceID}')">Delete Instance</button>
    </div>
      </div>
    </div>
  </div>
</div>
  `

  $(modalHTML).appendTo('#page-main')

  $('#deleteInstanceModal').modal('toggle')


}

function deleteInstance(instanceID){

  
  var error = document.getElementById('delete-instance-error')

  var button = document.getElementById('delete-btn-modal')

  button.innerHTML = `Deleting instance...`
  button.disabled = true

  try{
    firebase.firestore().collection('Instances').doc(instanceID).update({
      'runCommand': false
    }).then(() => {
      setTimeout(function(){
        firebase.firestore().collection('Instances').doc(instanceID).delete().then(() => {
          setTimeout(function(){
            //localStorage.removeItem('selectedInstance')
            window.location = '/instances'
           }, 1000);
        })
       }, 1000);
    })
  } catch(e){
    button.innerHTML = `Delete Instance`
    button.disabled = false


    error.innerHTML = 'An error has occured: ' + e.toString()

  }


}