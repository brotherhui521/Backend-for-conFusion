var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var authenticate = require("./authenticate");


var session = require("express-session");
var FileStore = require("session-file-store")(session);
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var leaderRouter = require("./routes/leaderRouter");
var promotionRouter = require("./routes/promotionRouter");
var uploadRouter =require("./routes/uploadRouter");

var app = express();

/*
app.all('*',(req,res, next)=>{
  if(req.secure){
    return next();
  }
  else{
    res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
  }
})
*/

const mongoose = require("mongoose");
const Dishes = require("./models/dishes");

var config=require('./config');
const url = config.mongoUrl;
const connect = mongoose.connect(url);


connect.then(
  (db) => {
    console.log("Connected successfully");
  },
  (err) => {
    console.log(err);
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//app.use(cookieParser("12345-67890-09876-54321"));
/*
app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);
*/

//passport
app.use(passport.initialize());
//app.use(passport.session());


//move these before authorization for access
app.use("/", indexRouter);
app.use("/users", usersRouter);

//basic authorization
 /*
function auth(req, res, next) {
  console.log(req.user);

  if (!req.user) {
    var err = new Error("You are not authenticated!");
    err.status = 403;
    next(err);
  } else {
    next();
  }
}
app.use(auth);
*/

app.use(express.static(path.join(__dirname, "public")));
//app.use(express.static(__dirname+'/public'));

app.use("/dishes", dishRouter);
app.use("/promotions", promotionRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload", uploadRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
