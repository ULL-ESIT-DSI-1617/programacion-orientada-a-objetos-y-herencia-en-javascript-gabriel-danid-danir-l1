//authsession.js
"use strict";
let express = require('express'),
    app = express(),
    session = require('express-session');
let cookieParser = require('cookie-parser');
let path = require('path');
let util = require("util");
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var html = fs.readFileSync('index.html');
var temperatura = fs.readFileSync('temperatura.html');

let bcrypt = require("bcrypt-nodejs");
let hash = bcrypt.hashSync("amyspassword");
let users = { 
  amy : hash, 
  dsi1617 : bcrypt.hashSync("dsi1617password")
};

let instructions = `


<br>
<p1> Fallo de autenticación, para acceder al libro diríjase a 10.6.128.107:8085/login e introduzca como usuario: dsi1617 y como password:dsi1617password</p1>
`;

let layout = function(x) { return x+"<br />\n"+instructions; };

app.use(cookieParser());
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
 
app.use(function(req, res, next) {
  console.log("Cookies :  "+util.inspect(req.cookies));
  console.log("session :  "+util.inspect(req.session));
  next();
});

app.get('/temperatura', function (req, res){
    res.writeHead(200, {'Content-Type': 'text/temperatura'});
    res.end(temperatura)

});
app.get('/login', function (req, res, next) {
 res.render('login');
});

// Authentication and Authorization Middleware
let auth = function(req, res, next) {
  if (req.session && req.session.user in users)
    return next();
  else
    return res.sendStatus(401); // https://httpstatuses.com/401
};
 



// Login endpoint
app.post('/login', function (req, res) {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    console.log('login failed');
    res.send('login failed');    
  } else if(req.body.username in users  && 
            bcrypt.compareSync(req.body.password, users[req.body.username])) {
    req.session.user = req.body.username;
    req.session.admin = true;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html)

  } else {
    console.log(`login ${util.inspect(req.query)} failed`);    
    res.send(layout(`login ${util.inspect(req.query)} failed. You are ${req.session.user || 'not logged'}`));    
  }
});
 
app.get('/', function(req, res) {
  res.send(instructions);
});
// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send(layout("logout success!"));
});
 
// Get content endpoint
app.get('/content/*?', 
    auth  // next only if authenticated
);
 
app.use('/content', express.static(path.join(__dirname, 'public')));

app.listen(8080);
console.log("app running at http://localhost:8080");

