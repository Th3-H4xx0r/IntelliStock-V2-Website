const express = require('express');
const app = express();
const path = require('path');
var cors = require('cors')
const router = express.Router();
const Alpaca = require('@alpacahq/alpaca-trade-api');
var cts = require('check-ticker-symbol');
const ejs = require('ejs')
const firebase = require('firebase');
var mysql = require('mysql'); 
var fs = require('fs');
var apiServerConnected = false

var http = require('http').createServer(app);
app.use(cors())

var betaCode = 'AHY8A7KL'




var con = mysql.createConnection({
  host: "localhost",
  user: "hackvslh_admin",
  password: "Minecraft123#",
  database: 'hackvslh_intellistock'
});


con.connect(function(err) {
  if (err) {
    console.log("Not connected to SQl server")
  } else {
    console.log("Connected!");
  }
});

/////////////////////////
//FIREBBASE INIT
/////////////////////////

var firebaseConfig = {
  apiKey: "AIzaSyCp1bV9SNvHj8uybb8rdDmMQdcOV4ZflIY",
  authDomain: "intellistock-v2.firebaseapp.com",
  databaseURL: "https://intellistock-v2.firebaseio.com",
  projectId: "intellistock-v2",
  storageBucket: "intellistock-v2.appspot.com",
  messagingSenderId: "169013852410",
  appId: "1:169013852410:web:d46d098ff63a80c56ff143",
  measurementId: "G-V9N5WBZX1Y"
};




// Initialize Firebase
firebase.initializeApp(firebaseConfig);



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
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    next();
  });


  
router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
  
});

  
router.get('/login',function(req,res){
  if(apiServerConnected){
    res.sendFile(path.join(__dirname+'/login.html'));
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }

  
});

router.get('/signup',function(req,res){

  if(apiServerConnected){
    
    res.sendFile(path.join(__dirname+'/signup.html'));
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }

  
});


router.get('/dashboard',function(req,res){

  
  if(apiServerConnected){
    
      
  try{
    var instanceID = req.query.instance

    if(instanceID){
      res.render(path.join(__dirname+'/dashboard.ejs'), {instance: instanceID})

    } else {
      res.send("Internal Server Error: Missing Instance ID")
    }
  } catch(e){
    console.log(e)
    res.send("Internal server error: " + e)
  }

  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }



});

router.get('/watchlist',function(req,res){

  if(apiServerConnected){
    
    try{
      var instanceID = req.query.instance
  
      if(instanceID){
        res.render(path.join(__dirname+'/stocks.ejs'), {instance: instanceID})
  
      } else {
        res.send("Internal Server Error: Missing Instance ID")
      }
    } catch(e){
      console.log(e)
      res.send("Internal server error: " + e)
    }

    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }

  


});

router.get('/history',function(req,res){

  if(apiServerConnected){
    
    try{
      var instanceID = req.query.instance
  
      if(instanceID){
        res.render(path.join(__dirname+'/history.ejs'), {instance: instanceID})
  
      } else {
        res.send("Internal Server Error: Missing Instance ID")
      }
    } catch(e){
      console.log(e)
      res.send("Internal server error: " + e)
    }

    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }



});

router.get('/settings',function(req,res){

  if(apiServerConnected){
    
    try{
      var instanceID = req.query.instance
  
      if(instanceID){
        res.render(path.join(__dirname+'/settings.ejs'), {instance: instanceID})
  
      } else {
        res.send("Internal Server Error: Missing Instance ID")
      }
    } catch(e){
      console.log(e)
      res.send("Internal server error: " + e)
    }
  
    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }



});

router.get('/predictions',function(req,res){

  if(apiServerConnected){
    
    try{
      var instanceID = req.query.instance
  
      if(instanceID){
        res.render(path.join(__dirname+'/predictions.ejs'), {instance: instanceID})
  
      } else {
        res.send("Internal Server Error: Missing Instance ID")
      }
    } catch(e){
      console.log(e)
      res.send("Internal server error: " + e)
    }
  
    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }




});

router.get('/explore',function(req,res){

  if(apiServerConnected){
    
  
    try{
      var instanceID = req.query.instance
  
      if(instanceID){
        res.render(path.join(__dirname+'/explore.ejs'), {instance: instanceID})
  
      } else {
        res.send("Internal Server Error: Missing Instance ID")
      }
    } catch(e){
      console.log(e)
      res.send("Internal server error: " + e)
    }
  
    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }




});


router.get('/create',function(req,res){

  if(apiServerConnected){

    res.sendFile(path.join(__dirname+'/createInstance.html'));
    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }


});

router.get('/settings',function(req,res){

  if(apiServerConnected){
    
    res.sendFile(path.join(__dirname+'/settings.html'));
    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }



});

router.get('/instances',function(req,res){

  if(apiServerConnected){
    
    res.sendFile(path.join(__dirname+'/instances.html'));
    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }



});

router.get('/terminal',function(req,res){

  if(apiServerConnected){
    
    res.sendFile(path.join(__dirname+'/terminal.html'));
    
  } else {
    res.sendFile(path.join(__dirname+'/downForMaintance.html'));
  }



});


router.get('/status',function(req,res){

    res.sendFile(path.join(__dirname+'/status.html'));

});



//var tickertape = require('tickertape')


router.get('/api/registerBeta',function(req,res){

  var email = req.query.email

  if(email){

    con.query("SELECT * FROM betaUsers WHERE email='" + email + "'", function(err, result){

      if(!err){
        var exists = false;

        for(const item of result){
          exists = true;
          //console.log(item)
        }

      
      if(exists == false){
        
        con.query("INSERT INTO betaUsers VALUES ('" + email + "')", function(err, result){
          res.send({code: 200, status: "success", message: "User registered"})
        })
        
      }
      } else if(err){

        console.log(err)

        con.query("CREATE TABLE betaUsers(email text)", function(err, result){

          con.query("INSERT INTO betaUsers VALUES ('" + email + "')", function(err, result){
            res.send({code: 200, status: "success", message: "User registered"})

          })

        })
  
      }


    })

  } else {
    res.send({code: 200, status: "failed", message: "Missing Parameters"})
  }

});

router.get('/api/verifyBetaCode',function(req,res){

  var code = req.query.code

  if(code){

    if(code == betaCode){
      res.send({code: 200, status: "success", message: "Valid"})

    } else {
      res.send({code: 200, status: "failed", message: "Invalid"})

    }


  } else {
    res.send({code: 200, status: "failed", message: "Missing Parameters"})
  }

});

router.get('/stock',function(req,res){
  try{
    var tickerCode = req.query.ticker
    res.render(path.join(__dirname+'/stock-info.ejs'), {ticker: tickerCode})
  } catch(e){
    res.send("Internal server error: " + e)
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
app.use('/terminaljs', express.static('terminalJs/'))
app.use('/apexcharts', express.static('apexcharts/'))
app.use('/node_modules', express.static('node_modules/'))


//add the router
app.use('/', router);
//app.listen(process.env.port || 3000);


/////////////////////////
//HTTP SERVER LISTENER CONFIG
/////////////////////////

app.get('*', function(req, res){
  res.status(404).sendFile(path.join(__dirname+'/serverError.html'));
});

var port  = 3012

http.listen(port, () => {

  firebase.firestore().collection("Config").doc("Config").onSnapshot(snap => {
    var data = snap.data()

    var obj = {"apiURL": data['apiURL']}

    apiServerConnected = false

  
    var socketURL = data['apiURL']

    var data = JSON.stringify(obj);



    var io = require('socket.io-client');

    var socket = io.connect(socketURL, {reconnect: true})

    console.log('Connecting to socket: ' + socketURL)

    // Add a connect listener
    socket.on('connect', function (socket) {
      console.log('Connected to socket!');
      apiServerConnected = true
    });

    socket.on('disconnect', function (socket) {
      console.log('Api server disconnected');
      apiServerConnected = false
    });



    fs.writeFile('config/config.json', data, 'utf8', function(err, data){

      if(err){
        console.log(err)
      }
      
    });
    
    //console.log(data['apiURL'])
  })

  
  console.log('listening on *:' + port);
});


  
