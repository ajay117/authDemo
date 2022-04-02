const express = require("express");
const app = express();
const User = require("./models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

mongoose
  .connect("mongodb://localhost:27017/authDemo")
  .then(() => {
    console.log("Mongo Connection Made");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
//Not included full path, but we should only include full path for views...
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "notagoodsecret" }));

app.get("/", (req, res) => {
  res.send("This is the homepage");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hash,
  });
  await user.save();
  req.session.user_id = user.user_id;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log({ username, password });
  const user = await User.findOne({ username });
  const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    req.session.user_id = user.user_id;
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
    res.send("This is secret! You cannot see me unless you are logged in");
  } else {
    res.redirect("/login");
  }
});

app.listen(3000, () => {
  console.log("Serving your App");
});
