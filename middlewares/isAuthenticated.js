const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      console.log(req.headers.authorization.replace("Bearer ", ""));
      const user = await User.findOne({
        token: req.headers.authorization.replace("Bearer ", ""),
      });
      if (user) {
        req.user = user;
        return next();
      } else {
        res.status(401).json({ error: "Unautorized 2" });
      }
    } else {
      res.status(401).json({ error: "Unautorized 2" });
    }
  } catch (error) {
    res.status;
  }

  //user: req.user._id
};

module.exports = isAuthenticated;

// const isAuthenticated = require("../middlewares/isAuthenticated")

//   console.log("Log depuis le middleware");

//   const isTokenValid = await User.findOne({ token: req.headers.authorization });
//   //const token = await User.findById(req.fields._id)
//   if (isTokenValid) {
//     req.user.account;
//     console.log("========>", req.user.account);
//     //Si j'appelle ce next, je peux sortir de ma fonction
//     next();
//   } else {
//     res.json("Unauthorized");
//   }
// };
//isAuthenticated
