const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nom: String,
  prenom: String,
  mail: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
