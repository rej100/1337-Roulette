var express = require("express");
var routes = require("./routes.js");
var latauth = require("./latauth.js");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var router = express.Router();

//router.use(express.static(__dirname));
function ValidateEmail(email)
{
    //WARNING!!! REGEX AHEAD!!!
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

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

router.get("/register", function(req, res)
{
  if(req.isAuthenticated())
  {
    res.redirect("/");
  }
  res.sendFile("./register.html", {root: __dirname});
});
router.get("/login", function(req, res)
{
  if(req.isAuthenticated())
  {
    res.redirect("/");
  }
  res.sendFile("./login.html", {root: __dirname});
});
router.get("/style.css", function(req, res)
{
  res.sendFile("./style.css", {root: __dirname});
});
router.get("/logout", EnsureAuthenticated, function(req, res)
{
  res.sendFile("./logout.html", {root: __dirname});
});

router.post("/regsend", function(req, res)
{
  var ep = 0, lr = 0, pr = 0, er = 0, err = 0, prr = 0, lrr = 0, errr = 0;
  var resp
  var login = req.body.login;
  var password = req.body.password;
  var email = req.body.email;
  var rPassword = req.body.rPassword;

  console.log(login);
  console.log(password);
  console.log(email);
  console.log(rPassword);
  /*
  ep: errors are present
  lr: login's empty
  pr: pass's empty
  er: email's empty
  err: email's not valid
  prr: password doesn't match with the other one
  lrr: login already in use
  errr: email already in use
  */

  if(login === "")
  {
    lr = 1;
    ep = 1;
  }
  if(password === "")
  {
    pr = 1;
    ep = 1;
  }
  if(email === "")
  {
    er = 1;
    ep = 1;
  }
  if(!ValidateEmail(email))
  {
    err = 1;
    ep = 1;
  }
  if(rPassword != password)
  {
    prr = 1;
    ep = 1;
  }
  /*
  if(latauth.getUserByLogin(login))
  {
    lrr = 1;
    ep = 1;
  }
  if(latauth.getUserByEmail(email))
  {
    errr = 1;
    ep = 1;
  }
  */
  latauth.getUserByEmail(email, function(error, usere)
  {
    if(usere)
    {
      errr = 1;
      ep = 1;
    }
    latauth.getUserByLogin(login, function(error, user)
    {
      if(user)
      {
        lrr = 1;
        ep = 1;
      }
      if(ep === 0)
      {
        var newUser = new latauth.User(
        {
          login: login,
          password: password,
          email: email,
          nick: "",
        });

        latauth.createUser(newUser, function(error, user)
        {
          if(err) throw err;
          console.log(user);
        });
      }
      resp = JSON.stringify(
      {
        ep: ep,
        lr: lr,
        pr: pr,
        er: er,
        err: err,
        prr: prr,
        lrr: lrr,
        errr: errr
      });
      /*
      console.log("err: " + err);
      console.log(resp);
      */
      res.send(resp);
    });
  });



});

/*
passport.use(new LocalStrategy(
  function(login, password, done)
  {
   latauth.getUserByLogin(login, function(err, user)
   {
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}
   	latauth.comparePass(password, user.password, function(err, isMatch)
    {
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		}
      else
      {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));
  */
  passport.use('local-login', new LocalStrategy(
  {
      usernameField : 'login',
      passwordField : 'password',
      passReqToCallback : true
  },
  function(req, login, password, done)
  {
    console.log(login);
    console.log(password);
    //var d = 0;
      latauth.getUserByLogin(login, function(err, user)
      {
        //console.log("whb");
          if (err)
          {
            console.log("aner");
            console.log(err);
            return done(err);
          }

          if (!user)
          {
            console.log("nuf");
            return done(null, false);
          }

          if (!latauth.comparePass(password, user.password))
          {
            console.log("passwbuf");
            return done(null, false);
          }

          console.log("DID I JUST DO THAT?!?!?!?");
          //console.log(user);
          return done(null, user);
      });

  }));



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  latauth.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post("/logisend", function(req, res, next)
{
  passport.authenticate("local-login", function(err, user, info)
  {
    var resp;
    //console.log("auths");
    //console.log(user);
    if(err)
    {
      return next(err);
    }
    if(!user)
    {
      resp = JSON.stringify(
      {
        case: 1
      });
      return res.send(resp);
       //return res.redirect("/u/login");
    }
    req.logIn(user, function(err)
    {
      //console.log("loginin");
      if(err)
      {
        return next(err);
      }
      //console.log("sendine");
      resp = JSON.stringify(
      {
        case: 0
      });
      return res.send(resp);
      //return res.redirect("lolol0olololoreeeeeeee");
    });
  })(req, res, next);
});
router.post("/logoutsend", function(req, res)
{
  var resp;
  req.logout();
  resp = JSON.stringify(
  {
    case: 10
  });
  res.send(resp);
});
/*
router.post("/logisend", passport.authenticate("local-login",
{
  successRedirect : "/index.html",
  failureRedirect : "/u/login"
}));
*/
/*
router.post("/logisend", function(req, res)
{
  console.log("glt");
});
*/

module.exports = router;



























//
