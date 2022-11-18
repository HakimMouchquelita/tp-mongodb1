const express = require("express");
const { updateUser } = require("moesif-browser-js");
//declarer les routes
const {
  createNewUser,
  loginByMailAndPassword,
  getUserByEmail,
  getUserByFirstname,
  getUserByName,
  getAllUsers,
  updateInfo,
  updateByPassword,
  updateByPhone,
  updateByEmail,
  deleteUser,
  logout,
} = require("../controllers/utilisateur");
const router = express.Router();

//definir les routes d'utilisateur post, get, put, delete et get:id
router.route("/register").post(createNewUser);
router.route("/login").get(loginByMailAndPassword);
router.route("/email/:email").get(getUserByEmail);
router.route("/prenom/:prenom").get(getUserByFirstname);
router.route("/nom/:nom").get(getUserByName);
router.route("/utilisateurs").get(getAllUsers);
router.route("/utilisateurs/").put(updateInfo);
router.route("/utilisateurs/:password").put(updateByPassword);
router.route("/utilisateurs/:telephone").put(updateByPhone);
router.route("/utilisateurs/:email").put(updateByEmail);
router.route("/utilisateurs/:email").delete(deleteUser);
router.route("/logout").post(logout);

module.exports = router;
