require("dotenv").config(); //needed as early as possible to hide environment vars
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

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
//-------------Encryption---------------//

//Adding the Encryption plug-in to the schema. Must be before setting the model.
userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ['password']});
//process.env.SECRET grabs the SECRET key from the .env file.

//--------------------------------------//

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
  const newUser = new User({
    email: req.body.username, //username and password is their name in register.ejs
    password: req.body.password,
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets"); //if registered, take to secrets page
    }
  });
});

app.post("/login", function (req, res) {
  const enteredEmail = req.body.username; //entered email and password
  const enteredPass = req.body.password;

  User.findOne({ email: enteredEmail }, function (err, foundUser) {
    if (!err) {
      if (foundUser) {
        //if a user with the entered email is found, then...
        if (foundUser.password === enteredPass) {
          //if its password is right, then...
          res.render("secrets");
        } else {
          res.send("Check if your email and password match.");
        }
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
