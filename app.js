require("dotenv").config(); //needed as early as possible to hide environment vars
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set("strictQuery", true);

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

console.log(process.env.SECRET);
//-------User Schemas and models--------//

const userSchema = new mongoose.Schema({
  //We need a mongoose Schema to apply encryption through mongoose-encryption, not just a simple js object
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

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

//------------Post methods--------------//

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    //take the written password and run a bcrypt hash, hash is the result
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.username, //username and password is their name in register.ejs
      password: hash, //save the hashed password as the user password
    });
    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets"); //if registered, take to secrets page
      }
    });
  });
});

app.post("/login", function (req, res) {
  const enteredEmail = req.body.username; //entered email and password
  const enteredPass = req.body.password; //md5# always produces the same key

  User.findOne({ email: enteredEmail }, function (err, foundUser) {
    if (!err) {
      if (foundUser) {
        bcrypt.compare(enteredPass, foundUser.password, function (err, result) {
          //compares enteredPassword with the hashed version during registry = foundUser.password
          // result == true or false
          if (result === true) {
            res.render("secrets");
          } else {
            res.send("Check your password and email combination!");
          }
        });
      } else {
        //if no user is found
        res.send("That user doesn't exist! check your email.");
      }
    } else {
      //if there was an overall error...
      console.log(err);
      res.send(err);
    }
  });
});

//--------------------------------------//

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
