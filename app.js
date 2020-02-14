require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/level2DB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const secret = process.env.SECRET_KEY;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = mongoose.model("user", userSchema);

app.route("/").get((req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ username: username }, (err, result) => {
      if (!err) {
        if (result) {
          if (result.password === password) {
            res.render("secret");
          } else {
            console.log("Incorrect Password.");
            res.render("result", {
              message: "Incorrect password."
            });
          }
        } else {
          console.log("registered yourself");
          res.render("result", {
            message: "Not registered! please registered yourself."
          });
        }
      } else {
        console.log(err);
        res.render("result", {
          message: "Error! please try again after sometime."
        });
      }
    });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const newUser = new User({
      username: username,
      password: password
    });
    newUser.save().then(() => {
      console.log("Successfully registered.");
      res.render("result", {
        message: "Woohu! successfully registered."
      });
    });
  });

app.listen(3000, () => {
  console.log("Server has been started at port no. 3000.");
});
