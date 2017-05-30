var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");

var app = express();
var coins = 1337;

function Roll()
{
  var randomNumber = Math.floor(Math.random() * 100 + 1);
  console.log("randomNumber: " + randomNumber);
  if(61 > randomNumber)
  {
    return 1;
  }
  else if (96 > randomNumber)
  {
    return 2;
  }
  else
  {
    return 3;
  }
}

function IncrementCoins()
{
  coins += 10;
  setTimeout(IncrementCoins, 10000);
  console.log("incremented coins by 10");
}

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set("port", process.env.PORT || 2777);

app.get("/", function(req, res)
{
  res.sendFile("index.html");
});
app.get("/getcoins", function(req, res)
{
  //console.log("gt");
  res.send(coins.toString());
});
app.post("/adml", function(req, res)
{
  if(req.body.sPass == "latawica")
  {
    coins += 100;
  }
});
app.post("/rollcl", function(req, res)
{
  var rolledColorS;
  var resp;
  rolledColorS = Roll();
        if(0 > req.body.cBet || req.body.cBet % 1 != 0)
        {
          resp = JSON.stringify(
          {
            err: 1,
            result: 0,
            rolled: 0
          });
        }
        else if(0 > coins - req.body.cBet)
        {
          resp = JSON.stringify(
          {
            err: 2,
            result: 0,
            rolled: 0
          });
        }
        else
        {
          if(req.body.cPicked == rolledColorS)
          {
            resp = JSON.stringify(
            {
              err: 0,
              result: 2,
              rolled: rolledColorS
            });
            coins -= req.body.cBet;
            switch(req.body.cPicked)
            {
              case 1:
                coins += req.body.cBet * 2;
                break;
              case 2:
                coins += req.body.cBet * 4;
                break;
              case 3:
                coins += req.body.cBet * 10;
                break;
              default:
                break;
            }
          }
          else if(req.body.cPicked == 0)
          {
            resp = JSON.stringify(
            {
              err: 3,
              result: 0,
              rolled: 0
            });
          }
          else
          {
            resp = JSON.stringify(
            {
              err: 0,
              result: 1,
              rolled: rolledColorS
            });
            coins -= req.body.cBet;
          }
        }
  res.send(resp);
});

IncrementCoins();

app.listen(app.get("port"), function()
{
  console.log("server started on port" + app.get("port"));
});




















//
