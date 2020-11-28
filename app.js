//jshint esverion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/images"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODBURI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const classSchema = {
  branch: String,
  Shift: String,
  year: String,
  subject: String,
  userId: String,
  slotId: String
};


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
const Class = mongoose.model("Class", classSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", {req, req});
});

app.get("/signup", (req, res) => {
  res.render("signup", {req: req});
});

app.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    Class.find({ userId: req.user.id }, (err, classes) => {
      if (err) {
        console.log(err);
      } else {
        res.render("home", {
          classList: classes,
          name: req.user.name,
          username: req.user.username,
          len: classes.length
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/newclass", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("newClass");
  } else {
    res.redirect("/login");
  }
});





app.post("/signup", (req, res) => {
  const password = req.body.password;
  const confirm = req.body.confirm;
  console.log(password!=confirm);
  if(password!=confirm){
    req.session.signuperror="Passwords don't match";
    res.redirect("/signup");
  } else {
  User.register(
    { name: req.body.name, username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        req.session.signuperror="Username Already Exists";
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/home");
        });
      }
    }
  );
  }
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.render("/login");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      });
    }
  });

});



app.listen(process.env.PORT || 8080 , function () {
  console.log("Server running at port 8080");
});
