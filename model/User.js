const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: String,
  lastname: String,
  email: String,
  telephone : Number,
  password: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };


