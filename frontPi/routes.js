var express = require("express");
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var latauth = require("./latauth.js");
var mongoose = require('mongoose');

var db = mongoose.connection;

function EnsureAuthenticated(req, res, next)
{
  //console.log("sta");
  if(req.isAuthenticated())
  {
    //console.log("a");
    return next();
  }
  else
  {
    //console.log("noa");
    res.redirect("/u/login");
  }
}

//Don't even try looking at this function without taking a look at "router.get("topfusers")" first!
function HandleTopQuery(i, limit, usrs, callback)
{
  var query;
  if(i < limit)
  {
    query = latauth.User.find({}, {"coins" : 1, "login" : 1}).sort({"coins" : -1}).skip(i).limit(1);
    query.exec(function(err, usr)
    {
      /*
      console.log("called with: " + i);
      console.log(usr);
      */
      usrs.push(usr);
      HandleTopQuery(i + 1, limit, usrs, callback);

    });
  }
  else
  {
    /*
    console.log("-----------------")
    console.log(usrs);
    console.log(usrs[0]);
    */
    callback(usrs);
  }
}

/*
function EnsureAuthenticated(req)
{
  console.log("sta");
  if(req.isAuthenticated())
  {
    console.log("a");
    return true;
  }
  else
  {
    console.log("noa");
    return false;
  }
}
*/

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

function ResUser(user)
{
  console.log(user.login + " res");
  user.toldTime = false;
  user.freeCollectable = true;
  user.save();
}


router.get("/", EnsureAuthenticated, function(req, res)
{
  console.log(req.user.login);
  //console.log("lsmth");
  res.sendFile("index.html", {root: __dirname});
});
router.get("/info", EnsureAuthenticated, function(req, res)
{
  res.end("Coming soon.");
});
router.get("/style.css", function(req, res)
{
  res.sendFile("style.css", {root: __dirname});
});
router.get("/rightArrow.png", function(req, res)
{
  res.sendFile("rightArrow.png", {root: __dirname});
});
/* gets the user with the highest amount of coins
router.get("/dbtest", function(req, res)
{
  var query = latauth.User.find({}).sort({"coins": -1}).limit(1);
  query.exec(function(err, usr)
  {
    console.log(usr);
  });
});
*/


//Attention! Attention! The most fucked up thing in node ever: async in for loops.
//i've tried to do that with a clean, beautiful for loop but because .exec is asynchronous it won't work so i had to do this, Ugh.
router.get("/topfusers", function(req, res)
{
  var resp;
  //var usrs = [];
  HandleTopQuery(0, 5, [], function(userino)
  {
    //console.log("usri: ");
    //console.log(userino);
    resp = JSON.stringify(
    {
      t1: userino[0],
      t2: userino[1],
      t3: userino[2],
      t4: userino[3],
      t5: userino[4]
    });
    res.send(resp);
  });
  /*
  for(var i = 0; i<5; ++i)
  {
    ...
  }
  */
});
router.get("/adml", EnsureAuthenticated, function(req, res)
{
  var resp;
  var timeTo;
  var oldT = new Date();
  //console.log(oldT);
  timeTo = new Date(oldT.getTime() + 10 * 1000);
  latauth.getUserById(req.user.id, function(err, user)
  {
    if(!user.toldTime)
    {
      user.toldTime = true;
      user.timeLeftF = timeTo;
    }
    if(user.freeCollectable)
    {
      user.freeCollectable = false;
      user.coins += 100;
      resp = JSON.stringify(
      {
        case: 0,
        timeLeft: user.timeLeftF
      });
      setTimeout(ResUser, 10 * 1000, user);
    }
    else
    {
      resp = JSON.stringify(
      {
        case: 1,
        timeLeft: user.timeLeftF
      });
    }
    user.save();
    res.send(resp);
  });
})
router.post("/getLogin", EnsureAuthenticated, function(req, res)
{
  var resp;
  resp = JSON.stringify(
  {
    login: req.user.login
  });
  res.send(resp);
});

/*
router.get("/index.html", function(req, res)
{
  console.log("lsmth");
  if(EnsureAuthenticated(req))
  {
    //res.sendFile("index.html");
  }
  console.log("smth");
});
*/
router.get("/getcoins", EnsureAuthenticated, function(req, res)
{
  //console.log("pls");
  //res.send(coins.toString());
  res.send(req.user.coins.toString());
});

router.post("/rollcl", function(req, res)
{
  /*
  Error codes:
  0: everything's k
  1: invalid bet
  2: not enough coins
  3: no color picked
  */
  var resp;
  var rolledColorS = Roll();
  var cBet = req.body.cBet;
  var cPicked = req.body.cPicked;
  latauth.getUserByLogin(req.user.login, function(error, user)
  {
    resp = JSON.stringify(
    {
      err: 0,
      result: 0,
      rolled: 0
    });

    if( 0 == cBet || 0 > cBet || (cBet % 1) != 0)
    {
      resp = JSON.stringify(
      {
        err: 1,
        result: 0,
        rolled: 0
      });
    }
    else if ( 1 != cPicked && 2 != cPicked && 3 != cPicked)
    {
      resp = JSON.stringify(
      {
        err: 3,
        result: 0,
        rolled: 0
      });
    }
    else if(0 > user.coins - cBet)
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
      user.coins -= cBet;

      if(cPicked != rolledColorS)
      {
        resp = JSON.stringify(
        {
          err: 0,
          result: 1,
          rolled: rolledColorS
        });
      }
      else
      {
        resp = JSON.stringify(
        {
          err: 0,
          result: 2,
          rolled: rolledColorS
        });
        switch(rolledColorS)
        {
          case 1:
            user.coins += cBet * 2;
            break;
          case 2:
            user.coins += cBet * 4;
            break;
          case 3:
            user.coins += cBet * 10;
            break;
          default:
            break;
        }
      }
      user.save();
    }
    console.log(user.coins);
    res.send(resp);
  });
  //console.log(req.body.cBet);
  //console.log(req.body.cPicked);

});

/*
router.post("/rollcl", function(req, res)
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
*/

module.exports = router;
