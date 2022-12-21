require("dotenv").config(); //needed as early as possible to hide environment vars
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//Require these 3 packages
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//Sessions setup
app.use(
  session({
    secret: "tis ouah lihl secreht guvnah.",
    resave: false,
    saveUninitialized: false,
  })
);

//initialize passport and use it to manage sessions
app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery", true);

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

console.log(process.env.SECRET);
//-------User Schemas and models--------//

const userSchema = new mongoose.Schema({
  //We need a mongoose Schema to apply encryption through mongoose-encryption, not just a simple js object
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose); //hashes and salts, saves users into mongodb. Needs to be in this order.

const User = new mongoose.model("User", userSchema);

//must be below our model
passport.use(User.createStrategy()); //handles user authentication

passport.serializeUser(User.serializeUser()); //creates cookies when session is opened
passport.deserializeUser(User.deserializeUser()); //destroys cookies session closed

//--------------------------------------//

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  //3. check if user is authenticated, render this page, if not, send to login page
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
//------------Post methods--------------//

app.post("/register", function (req, res) {
  User.register(//this is a passport method
    { username: req.body.username },//given email
    req.body.password, //given password
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register"); //try again
      } else {
        passport.authenticate("local")(req, res, function () {//same as used in login
          res.redirect("/secrets");//Once authenticated send to secrets to check for authentication
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  //create "user" to be passed onto passport to handle
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  //calling a passport method on req, called login. req.login()
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else { 
      passport.authenticate("local")(req,res, function(){//1. authenticate the user, log him in and create his session cookies
        res.redirect("/secrets");//2. redirect to secrets page where it will be checked if the user is authenticated
      })
    }
  })
});

//--------------------------------------//

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
