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
const Alpaca = require('@alpacahq/alpaca-trade-api');
const { StringDecoder } = require('string_decoder');

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

  
router.get('/login',function(req,res){
    res.sendFile(path.join(__dirname+'/login.html'));
  
});

router.get('/signup',function(req,res){
    res.sendFile(path.join(__dirname+'/signup.html'));
  
});

router.get('/dashboard',function(req,res){
    res.sendFile(path.join(__dirname+'/dashboard.html'));
  
});

router.get('/stocks',function(req,res){
  res.sendFile(path.join(__dirname+'/stocks.html'));

});


router.get('/getBalance',function(req,res){

  var headers = req.headers

  var key = headers['key']

  var secret = headers['secret']

  var error = false

  if(key && secret){

      const alpaca = new Alpaca({
        keyId: key, //'PKVA3SOZ46HMS516041U'
        secretKey: secret, //'PwiBhclYWsz2oVkQxtg6npf6BHUL4XqrrIrfgIe9'
        paper: true,
        usePolygon: false
      })
    
    
      alpaca.getPortfolioHistory({
        date_start: "2020-11-24",
        period: 'intraday',
        timeframe: '1m',
        extended_hours: true
      }).catch(e => {
        error = true
        res.send({code: 200, status: "failed", message: e.message, data: e})


      }).then(val => {
        //console.log(val)

        if(error == false){
          res.send({code: 200, status: "success", message: val})
        }

      })

   
  } else {
    res.send({code: 200, status: "failed", message:"Missing headers"})
  }
});

router.get('/verifyCreds',function(req,res){

  var headers = req.headers

  var key = headers['key']

  var secret = headers['secret']

  var error = false

  if(key && secret){

      const alpaca = new Alpaca({
        keyId: key, //'PKVA3SOZ46HMS516041U'
        secretKey: secret, //'PwiBhclYWsz2oVkQxtg6npf6BHUL4XqrrIrfgIe9'
        paper: true,
        usePolygon: false
      })

      try{

        account = alpaca.getAccount().catch(e => {
          res.send({code: 200, status: "failed", message:"Invalid", data: e})
          error = true

        }).then(() => {
          if(error == false){
            res.send({code: 200, status: "success", message:"Valid", data: account})

          }
        });

        
      } catch(e){
        res.send({code: 200, status: "failed", message:"Invalid", data: e})
      }


   
  } else {
    res.send({code: 200, status: "failed", message:"Missing headers"})
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
  console.log('listening on *:3102');
});


  
