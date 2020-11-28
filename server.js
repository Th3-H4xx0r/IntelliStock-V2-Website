const express = require('express');
const app = express();
const path = require('path');
var cors = require('cors')
const router = express.Router();
const Alpaca = require('@alpacahq/alpaca-trade-api');
var cts = require('check-ticker-symbol');
const ejs = require('ejs')

var http = require('http').createServer(app);
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
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
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

router.get('/stock',function(req,res){
  try{
    res.sendFile(path.join(__dirname+'/stock-info.html'));

  } catch(e){
    res.send("ERROR: " + e.toString())
  }
  //var tickerCode = req.query.ticker
  //res.render(path.join(__dirname+'/stock-info.ejs'), {ticker: "TSLA"})

});

router.get('/viewStock',function(req,res){
  //var tickerCode = req.query.ticker
  //res.render(path.join(__dirname+'/stock-info.ejs'), {ticker: "TSLA"})
  res.sendFile(path.join(__dirname+'/stock-info.html'));

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
});

http.listen(3102, () => {
  console.log('listening on *:3102');
});


  
