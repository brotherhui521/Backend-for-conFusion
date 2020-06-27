var express = require("express");
var usersRouter = express.Router();
const Users = require("../models/users");
var bodyParser = require("body-parser");
usersRouter.use(bodyParser.json());
var passport = require("passport");
var authenticate = require("../authenticate");
var cors = require("./cors");
/* GET users listing. Will edit for admin uses */
usersRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Users.find({})

        .then(
          (users) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(users);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
  usersRouter.route("/signup")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post( cors.corsWithOptions, (req, res, next) => {
    Users.register(
      new Users({ username: req.body.username }),
      req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json({ err: err });
        } else {
          if (req.body.firstname) {
            user.firstname = req.body.firstname;
          }
          if (req.body.lastname) {
            user.lastname = req.body.lastname;
          }
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.json({ err: err });
              return;
            }
            passport.authenticate("local")(req, res, () => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ success: true, status: "Registration Successful!" });
            });
          });
        }
      }
    );
  });

  usersRouter.route("/login")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  }).post(
    cors.corsWithOptions,
    passport.authenticate("local"),
    (req, res) => {
      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token: token,
        status: "You are successfully logged in!",
      });
    }
  )
usersRouter.route("/logout")
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
}).get( cors.cors, (req, res) => {
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

  usersRouter.get('/facebook/token',passport.authenticate('facebook-token'),(req,res)=>{
    if(req.user){
      var token=authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token: token,
        status: "You are successfully logged in!",
      });
    }
  })

module.exports = usersRouter;
