const express = require('express');
const app = express();
const path = require('path');
var cors = require('cors')
const router = express.Router();
var fs = require('fs');
const firebase = require('firebase');
var admin = require('firebase-admin');
const request = require('request');
const { json } = require('express');

var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(cors())

app.use(function (req, res, next) {
    const origin = req.get('origin');
    //res.header('Access-Control-Allow-Origin', origin);
    //res.header('Access-Control-Allow-Credentials', true);
    //res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    //res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  
    // intercept OPTIONS method
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {

      next();
    }
  })
  
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });


  
router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
  
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


router.get('/updatePrice',function(req,res){
    //res.sendFile(path.join(__dirname+'/serverError.html'));

    var ticker = req.query.ticker

    var timestamp = req.query.timestamp
    
    var strTime = req.query.strTime

    var price = req.query.price

    if(ticker && timestamp && strTime && price){

        ticker = ticker.toUpperCase();

        var update = [strTime, parseFloat(price), parseInt(timestamp)]

        var rawData = fs.readFileSync("data.json");

        var jsonData = JSON.parse(rawData);

        var tickerData = jsonData[ticker]

        console.log(isEmpty(jsonData))

        if (isEmpty(jsonData)){

            tickerDataRaw = {}

            tickerDataRaw[ticker] = {
                "todayPrices": [
                    update
                ]
            }

            tickerData = JSON.stringify(tickerDataRaw)

            fs.writeFileSync('data.json', tickerData)

            res.send({code: 200, status: "success", message: "Updated data"})
        } else if(tickerData == undefined){
    
                jsonData[ticker] = {
                    "todayPrices": [
                        update
                    ]
                }
    
                writeData = JSON.stringify(jsonData)
    
                fs.writeFileSync('data.json', writeData)
    
                res.send({code: 200, status: "success", message: "Updated data"})
        } else if(tickerData != undefined){
            console.log(tickerData)
            pricesData = tickerData['todayPrices']

            console.log(pricesData)

            if(pricesData != undefined){
                pricesData.push(update);
            } else{
                tickerData['todayPrices'] = [update];
            }

            console.log(jsonData)

            writeData = JSON.stringify(jsonData)
    
            fs.writeFileSync('data.json', writeData)

            res.send({code: 200, status: "success", message: "Updated Data"})
        }

    } else {
        res.send({code: 200, status: "failed", message:"Missing parameters"})
    }
  
});

router.get('/updateTransaction',function(req,res){
    //res.sendFile(path.join(__dirname+'/serverError.html'));

    var ticker = req.query.ticker

    var timestamp = req.query.timestamp
    
    var strTime = req.query.strTime

    var price = req.query.price

    var action = req.query.action

    if(ticker && timestamp && strTime && price && action){

        var update = [strTime, action, parseFloat(price), parseInt(timestamp)]

        var rawData = fs.readFileSync("data.json");

        var jsonData = JSON.parse(rawData);

        var tickerData = jsonData[ticker]

        if (isEmpty(jsonData)){

            tickerDataRaw = {}

            tickerDataRaw[ticker] = {
                "transactions": [
                    update
                ]
            }

            tickerData = JSON.stringify(tickerDataRaw)

            fs.writeFileSync('data.json', tickerData)

            res.send({code: 200, status: "success", message: "Updated data"})
        } else if(tickerData == undefined){
    
                jsonData[ticker] = {
                    "transactions": [
                        update
                    ]
                }
    
                writeData = JSON.stringify(jsonData)
    
                fs.writeFileSync('data.json', writeData)
    
                res.send({code: 200, status: "success", message: "Updated data"})
        } else if(tickerData != undefined){
            console.log(tickerData)
            pricesData = tickerData['transactions']

            console.log(pricesData)

            if(pricesData != undefined){
                pricesData.push(update);
            } else{
                tickerData['transactions'] = [update];
            }

            console.log(jsonData)

            writeData = JSON.stringify(jsonData)
    
            fs.writeFileSync('data.json', writeData)

            res.send({code: 200, status: "success", message: "Updated Data"})
        }

    } else {
        res.send({code: 200, status: "failed", message:"Missing parameters"})
    }
  
});

router.get('/getData',function(req,res){
    //res.sendFile(path.join(__dirname+'/serverError.html'));

    var ticker = req.query.ticker


    if(ticker){

        var rawData = fs.readFileSync("data.json");

        var jsonData = JSON.parse(rawData);

        var tickerData = jsonData[ticker]

        if (isEmpty(jsonData)){

            tickerDataRaw = {}

            res.send({code: 200, status: "success", message: tickerDataRaw})
        }  else if(tickerData == undefined){
            res.send({code: 200, status: "success", message: {}})
        } else{
            res.send({code: 200, status: "success", message: tickerData})
        }

    } else {
        res.send({code: 200, status: "failed", message:"Missing parameters"})
    }
  
});
/////////////////////////
//STATIC ASSETS HANDLER
/////////////////////////
app.use('/Assets', express.static('Assets/'))
app.use('/handle-request', express.static('ServerNotHandleRequest/'))
app.use('/config', express.static('config/'))
app.use('/css', express.static('css/'))
app.use('/js', express.static('js/'))

//add the router
app.use('/', router);
//app.listen(process.env.port || 3000);


/////////////////////////
//HTTP SERVER LISTENER CONFIG
/////////////////////////

app.get('*', function(req, res){
  res.status(404).sendFile(path.join(__dirname+'/serverError.html'));
  res.sendFile(path.join(__dirname+'/serverError.html'));
});

http.listen(3102, () => {
  console.log('listening on *:3101');
});


  
