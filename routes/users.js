const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dg67widyi",
  api_key: "972372211632688",
  api_secret: "6Nb1Iyj95pJbVND1k5Pff_7QCy0",
  secure: true,
});

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const avatarToUpload = req.files.picture.path;
    const avatarResult = await cloudinary.uploader.upload(avatarToUpload);
    const password = req.fields.password;
    const salt = uid2(16);
    const newUser = new User({
      email: req.fields.email,
      account: {
        username: req.fields.username,
        phone: req.fields.phone,
        avatar: avatarResult,
      },

      salt: salt,
      hash: SHA256(password + salt).toString(encBase64),
      token: uid2(16),
    });

    await newUser.save();
    console.log("===>", newUser.account);

    res.status(200).json({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
        phone: newUser.account.phone,
        avatar: newUser.account.avatar.secure_url,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (!user) {
      res.status(200).json("Unauthorized !");
      console.log("Unauthorized !");
    } else {
      const password = req.fields.password;
      const hash = SHA256(password + user.salt).toString(encBase64);
      if (user.hash !== hash) {
        res.status(200).json("Unauthorized !");
        console.log("Unauthorized !");
      } else {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
        console.log("On peut se connecter");
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
