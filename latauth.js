var mongoose = require('mongoose');
var routes = require("./routes.js");

var userSchema = mongoose.Schema(
{
  login: {type: String, index: true},
  password: {type: String},
  email: {type: String},
  nick: {type: String},
  coins: {type: Number, default: 1000},
  freeCollectable: {type: Boolean, default: true},
  timeLeftF: {type: Date, default: Date.now},
  toldTime: {type: Boolean, default: false},
  regDate: {type: Date, default: Date.now}
});

var User = mongoose.model('User', userSchema);

function createUser(newUser, callback)
{
  newUser.save(callback);
}
function getUserByLogin(login, callback)
{
  var query = {login: login};
  User.findOne(query, callback);
}
function getUserById(id, callback)
{
  User.findById(id, callback);
}
function getUserByEmail(email, callback)
{
  var query = {email: email};
  User.findOne(query, callback);
}
function comparePass(provPass, realPass)
{
  //var isMatch;
  if(provPass === realPass)
  {
    return true;
    //isMatch = true;
  }
  else
  {
    return false;
    //isMatch = false;
  }
  //callback(null, isMatch);
}
module.exports = {User, createUser, getUserByLogin, getUserById, getUserByEmail, comparePass};
