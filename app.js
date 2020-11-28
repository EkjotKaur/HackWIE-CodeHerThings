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

mongoose.connect(
  "mongodb+srv://admin-EkjotKaur:Test123@attendance.e3ui6.mongodb.net/attendanceDB",
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

const slotSchema = {
  branch: String,
  Shift: String,
  year: String,
};

const attendanceSchema = {
  Days: {
    type: [Number],
  },
  stdId: String,
  month: Number,
  classId: String,
  totalDays: Number,
  present: Number,
};

const studentSchema = {
  enrollNo: String,
  name: String,
  branch: String,
  Shift: String,
  year: String,
  present: Number,
  slotId: String,
};

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
const Class = mongoose.model("Class", classSchema);
const Slot = mongoose.model("Slot", slotSchema);
const Student = mongoose.model("Student", studentSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);


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

app.get("/:presentClassId/:presentBatchId/updateClass", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("updateClass", {
      presentClassId: req.params.presentClassId,
      presentBatchId: req.params.presentBatchId,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/:presentClassId/:presentBatchId/deleteClass", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("deleteClass", {
      presentClassId: req.params.presentClassId,
      presentBatchId: req.params.presentBatchId,
    });
  } else {
    res.redirect("/login");
  }
});





app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
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

app.post("/newclass", (req, res) => {
  if (req.body.year == "2019") {
    Slot.findOne(
      { branch: req.body.branch, Shift: req.body.Shift, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: req.body.Shift,
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
            canOpen: true
          });

          batch.save();
          res.redirect("home");
        }
      }
    );
  } else {
    Slot.findOne(
      { branch: req.body.branch, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: "",
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
          });

          batch.save();
          res.redirect("home");
        }
      }
    );
  }
});

app.post("/newclass", (req, res) => {
  if (req.body.year == "2019") {
    Slot.findOne(
      { branch: req.body.branch, Shift: req.body.Shift, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: req.body.Shift,
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
            canOpen: true
          });

          batch.save();
          res.redirect("home");
        }
      }
    );
  } else {
    Slot.findOne(
      { branch: req.body.branch, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: "",
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
          });
          
          batch.save();
          res.redirect("home");
        }
      }
    );
  }
});

app.post("/:presentClassId/:presentBatchId/updateClass", (req, res) => {
  Class.findOneAndUpdate(
    { _id: req.params.presentClassId },
    { subject: req.body.subject },
    (err, updatedBatch) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/home");
      }
    }
  );
});

app.post("/:presentClassId/:presentBatchId/deleteClass", (req, res) => {
  // Class.findOne({_id: req.params.presentClassId}, (err, foundC) => {
  //   console.log(foundC);
  // });
  Class.findByIdAndDelete(
    { _id: req.params.presentClassId },
    (err, deletedClass) => {
      if (err) {
        console.log(err);
      } else {
        console.log(deletedClass);
        // Attendance.find({classId: req.params.presentClassId}, (err, delA) => {
        //   console.log(delA);
        // });
        Attendance.deleteMany({classId: req.params.presentClassId}, (err, deletedAtt) => {
          if(err){
            console.log(err);
          } else {
            console.log(deletedAtt);
            res.redirect("/home");
          }
        });  
      }
    }
  );
});

app.listen(process.env.PORT || 8080 , function () {
  console.log("Server running at port 8080");
});
