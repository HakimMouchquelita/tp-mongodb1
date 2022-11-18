const express = require("express");
const app = express();
const argon2 = require("argon2");
const mongoose = require("mongoose");
const { User } = require("./model/user");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Create a new user
//app.post("/register", async (req, res) 
const createNewUser = async (req, res) => 
{
  const { firstname, lastname, email, password, confirmPassword, telephone } =
    req.body;

  try {
    const user = await User.findOne({
      email,
    })
      .select("-__v")
      .lean();
    if (user) {
      return res.status(400).json({
        status: "error",
        error: "Username already in use",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        error: "Passwords do not match",
      });
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = new User({
      firstname,
      lastname,
      email,
      telephone,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      status: "success",
      data: newUser,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// Login with email and password
//app.post("/login", async (req, res) 
const loginByMailAndPassword = async (req, res) => 
{
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  })
    .select("-__v")
    .lean();

  if (!user) {
    return res.status(400).json({
      status: "error",
      error: "Invalid email/password",
    });
  }
  if (await argon2.verify(user.password, password)) {
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRATION_MS,
      }
    );

    return res.status(200).json({
      data: token,
      user: user,
    });
  }
  res.status(400).json({
    status: "error",
    error: "email ou password incorrect, essayer encore",
  });
};

// Get user info by email
//app.get("/mail/:mail", async (req, res) 
const getUserByEmail = async (req, res) => 
{
  var params = req.params;

  const users = await User.find({ mail: params.mail }).select("-__v");

  return res.status(200).json({ error: false, users });
};

// Get all users by firstname
//app.get("/prenom/:prenom", async (req, res) 
const getUserByFirstname = async (req, res) =>
 {
  var params = req.params;

  const users = await User.find({ prenom: params.prenom });

  return res.status(200).json({ error: false, users });
};

// Get all users by name
//app.get("/nom/:nom", async (req, res) => 
const getUserByName = async (req, res) =>
{
  var params = req.params;

  const users = await User.find({ nom: params.nom }).select("-__v");
  /**ou sans utiliser select   
 *   var usr = [];
  for (const element of user) {
    var a = (element.__v = undefined);
    usr.push(element);
  }
 */
  return res.status(200).json({ error: false, users });
};

// Get all users
const getAllUsers = async (req, res) =>{
  try {
    const jwtstatus = checkJWT(req.headers.authorization);
    if (jwtstatus.status) {
      const user = await User.findOne({
        email: jwtstatus.decoded.email,
      });
      res.status(200).json(user);
    } else {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Check jwt validity
function checkJWT(full_token) {
  const token = full_token.split(" ")[1];
  if (!token)
    return {
      status: false,
      message: "Auth token n'est pas correct",
    };
  else {
    try {
      let decoded = jwt.verify(token, JWT_SECRET);
      return {
        status: true,
        message: "Token verifié",
        decoded: decoded,
      };
    } catch (err) {
      return {
        status: false,
        message: "Token n'est pas valide",
        error: err,
      };
    }
  }
}

// edit user info
const updateInfo = async (req, res) =>{
  try {
    const jwtstatus = checkJWT(req.headers.authorization);
    if (jwtstatus.status) {
      const user = await User.findOne({
        email: jwtstatus.decoded.email,
      }).select("-password -__v -dateCreated -dateUpdated");
      if (user) {
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.phone = req.body.phone;
        user.dateOfBirth = req.body.dateOfBirth;
        user.save();
        res.status(201).json(user);
        message: "Modification du compte réussie";
      } else {
        res.status(404).json({
          message: "pas trouvé",
        });
      }
    } else {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// edit user by password
const updateByPassword = async (req, res) => {
  try {
    const jwtstatus = checkJWT(req.headers.authorization);
    if (jwtstatus.status) {
      const user = await User.findOne({
        email: jwtstatus.decoded.email,
      }).select("-__v -dateCreated -dateUpdated");
      if (user) {
        if (await argon2.verify(user.password, req.body.oldPassword)) {
          user.password = await argon2.hash(req.body.newPassword);
          user.save();
          res.status(201).json(user);
          message: "mot de passe modifié";
        } else {
          res.status(400).json({
            message: "password incorrect",
          });
        }
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    } else {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// edit user by phone
const updateByPhone = async (req, res) => {
  try {
    const jwtstatus = checkJWT(req.headers.authorization);
    if (jwtstatus.status) {
      const user = await User.findOne({
        email: jwtstatus.decoded.email,
      }).select("-__v -password -dateCreated -dateUpdated");
      if (user) {
        user.telephone = req.body.telephone;
        user.save();
        res.status(201).json(user);
        msg: "Numéro de téléphone modifié";
      } else {
        res.status(404).json({
          message: "utilisateur non trouvé",
        });
      }
    } else {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// edit user by email
const updateByEmail = async (req, res) => {
  try {
    const jwtstatus = checkJWT(req.headers.authorization);
    if (jwtstatus.status) {
      const user = await User.findOne({
        email: jwtstatus.decoded.email,
      }).select("-__v -password -dateCreated -dateUpdated");
      if (user) {
        user.email = req.body.email;
        user.save();
        res.status(201).json(user);
        message: "email modifié";
      } else {
        res.status(404).json({
          message: "utilisateur non trouvé",
        });
      }
    } else {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//delete user
const deleteUser = async (req, res) => {
  const jwtstatus = checkJWT(req.headers.authorization);
  if (jwtstatus.status) {
    const user = await User.findOne({
      email: jwtstatus.decoded.email,
    }).select("-__v -password -dateCreated -dateUpdated");
    if (user) {
      User.deleteOne({ mail: req.params.mail }, function (err) {
        if (err) return handleError(err);
      });
      res.status(201).json({
        error: false,
        message: "Votre profil a été supprimé ! Un email de confirmation...",
      });
    } else {
      return res.status(404).json({
        error: true,
        message: "user not found",
      });
    }
  }
};

//logout utilisatuer inspired by https://stackoverflow.com/questions/3521290/logout-get-or-post
const logout = async (req, res) =>{
  try {
    const jwtstatus = checkJWT(req.headers.authorization);
    if (jwtstatus.status) {
      const user = await User.findOne({
        email: jwtstatus.decoded.email,
      });
      if (user) {
        jwt.sign(
          {
            email: user.email,
          },
          JWT_SECRET,
          {
            expiresIn: "1s",
          },
          (err, token) => {
            if (err) {
              res.status(500).json(err);
            } else {
              res.status(200).json({
                message: "Logged out",
                token: token,
              });
            }
          }
        );
      } else {
        res.status(401).json({
          message: "Unauthorized",
        });
      }
    } else {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};


//exporter le module
module.exports = {
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
  logout
};