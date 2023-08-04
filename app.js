//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const { spawn } = require('child_process');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

const saltRounds = 10;

var conn = mongoose.createConnection("mongodb://localhost:27017/userDB", {useNewUrlParser:true});
var conn2 = mongoose.createConnection("mongodb://localhost:27017/voteDB", {useNewUrlParser:true});
//mongoose.connect("mongodb://localhost:27017/voteDB", {useNewUrlParser:true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const voteSchema = new mongoose.Schema({
  vote: Number
});

//const secret = "ThoughIamNotaCryptanalaystButstillIloveCryptography";
//userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});

const User = conn.model("Usercollection", userSchema);
const Vote = conn.model("Votecollection", voteSchema);

app.get("/",function(req,res){
  res.render("home");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/secrets", function(req,res){
  res.render("secrets");
});
app.get("/end", function(req,res){
  res.render("end");
});

app.post("/register", function(req,res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const newUser = new User({
      email:req.body.username,
      password: hash
    });

    newUser.save(function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("secrets");
      }
    });
  })
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        // if(foundUser.password === password){
        //   res.render("secrets");
        // }
        bcrypt.compare(password, foundUser.password, function(err, result){
          if(result === true){
            res.render("secrets");
          }
        })
      }
    }
  });
});

app.post("/secrets", function (req, res) {
  // latitude = req.body.lat;
  // longitude = req.body.long;
  var data = req.body;
  console.log(data);
  const childPython = spawn('python', ['main.py']);
  childPython.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  childPython.stderr.on('data', function (data) {
    console.error(data.toString());
  });
  childPython.on('close', function (code) {
    console.log(code);
  });


  // console.log("the latitude is " + latitude + "and the longitude is " + longitude);
  res.redirect("/end");
})

app.listen(3000,function(){
  console.log("Server is now on.");
});
