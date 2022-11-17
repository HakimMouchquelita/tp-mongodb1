const express = require("express");
const app = express();
const argon2 = require("argon2");
const port = 3000;
const mongoose = require("mongoose");
const { User } = require("./model/user");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/:test", (req, res) => {
  console.log(req.params.test);
  console.log(req.headers.test);
  return res.status(200).json({
    error: false,
    message: "Hello World",
  });
});

app.post("/user", async (req, res) => {
  console.log(req.body.name);
  console.log(req.body.lastname);
  console.log(req.body.mail);
  console.log(req.body.password);

  const hash = await argon2.hash(req.body.password);
  console.log(hash);

  const user = new User();
  user.name = req.body.name;
  user.lastname = req.body.lastname;
  user.mail = req.body.mail;
  user.password = hash;
  user.save();

  res.status(200).json({
    error: false,
    message: "Hello World",
  });
});

const start = async () => {
  try {
    var test = await mongoose.connect("mongodb://0.0.0.0:27017/test");
    return app.listen(3000, () => console.log("Server started on port 3000"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
