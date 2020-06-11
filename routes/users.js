var express = require("express");
var usersRouter = express.Router();
const Users = require("../models/users");
var bodyParser = require("body-parser");
usersRouter.use(bodyParser.json());
var passport = require("passport");
/* GET users listing. Will edit for admin uses */
usersRouter.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

usersRouter.post('/signup', (req, res, next) => {
  Users.register(new Users({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});

usersRouter.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
}); 

usersRouter.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

module.exports = usersRouter;
