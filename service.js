var bodyParser      = require('body-parser');
var register        = require('./register.js');
var express         = require('express');
var fs              = require('fs');
var path            = require('path');
var compression     = require('compression');
var nconf           = require('nconf');
var app             = express();
var rsRouter        = express.Router();
var rsConfRouter    = express.Router();
var schoolRouter    = express.Router();
var subdomainRouter = express.Router();

nconf.env('__');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(compression());

subdomainRouter.use(function (req, res, next) {
  if (req.subdomains.length > 0) {
    switch (req.subdomains[0]) {
      case 'conf':
        rsConfRouter(req, res, next);
        break;
      case 'school':
        schoolRouter(req, res, next);
        break;
      default:
        rsRouter(req, res, next);
    }
  } else {
    next();
  }
});

rsRouter.use(express.static('./appBin'));
rsConfRouter.use(express.static('./conferenceBin'));
schoolRouter.use(express.static('./schoolBin'));

app.use(subdomainRouter);
app.use(rsRouter);
app.use(rsConfRouter);
app.use(schoolRouter);

app.get('/csvdb', function (req, res) {
  fs.readFile(path.join(__dirname, 'registered.txt'), 'utf8', function(_, data) {
    console.log(data);
    res.send(data);
  });
});

app.get('/subscription', function (req, res) {
  fs.readFile(path.join(__dirname, 'subscription.txt'), 'utf8', function(_, data) {
      console.log(data);
      res.send(data);
  });
});

app.get('/buy-ticket', function (req, res) {
  res.redirect('http://www.kvitki.by/ru/event/23971');
});

app.post('/register', function (req, res) {
  register(req.body);
  res.redirect('/');
});

app.post('/subscribe', function (req, res) {
  console.log(JSON.stringify(req.query.email));

  fs.writeFile('subscription.txt', req.query.email + ";", {flag: 'a'}, function (err) {
      res.send('error');
  });
  res.send('done');
});


var PORT = nconf.get('service:port') || 3000;
app.listen(PORT, function () {
  console.log('server is listening on port ' + PORT);
});
