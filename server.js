var express = require('express');
var cors = require('cors');
const emails = require('./controllers/emails');
const acc = require('./controllers/account');


const jsonParser = express.json();
var app = express();
app.use(cors());

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/api/v1", function(req, res){
  res.send({'msg': 'Welcome to emails reader API'});
});

app.post("/api/v1/emails", jsonParser, emails.collectMessages);
app.post("/api/v1/account/validate", jsonParser, acc.validateAccount);
app.post("/api/v1/account/add", jsonParser, acc.addAccount);

app.listen(3000, function(){
  console.log("API app started");
});
