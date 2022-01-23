const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dg67widyi",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const Offer = require("../models/Offer");
const User = require("../models/User");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });

    const result = await cloudinary.uploader.upload(req.files.picture.path);
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.files.price,
      product_details: [
        {
          MARQUE: req.fields.brand,
          TAILLE: req.fields.size,
          ETAT: req.fields.condition,
          COULEUR: req.fields.color,
          EMPLACEMENT: req.fields.city,
        },
      ],

      product_image: result,
      owner: user,
    });

    await newOffer.save();
    res.json({
      _id: newOffer._id,
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_details: newOffer.product_details,
      owner: {
        account: newOffer.owner.account.username,
        phone: newOffer.owner.account.phone,
        avatar: newOffer.owner.account.avatar.secure_url,

        _id: newOffer.owner._id,
      },
      product_image: newOffer.product_image.secure_url,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  // try {
  // const offer = await User.findOne
  const title = req.query.title;
  const price_min = req.query.priceMin;
  const price_max = req.query.priceMax;

  const filtersObject = {};

  if (title) {
    filtersObject.product_name = new RegExp(title, "i");
  }

  if (price_min) {
    filtersObject.product_price = {
      $gte: price_min,
    };
  }

  if (price_max) {
    if (filtersObject.product_price) {
      filtersObject.product_price.$lte = price_max;
    } else {
      filtersObject.product_price = {
        $lte: price_max,
      };
    }
  }

  console.log(filtersObject);

  const sortObject = {};
  if (req.query.sort === "price-desc") {
    sortObject.product_price = "desc";
  } else if (req.query.sort === "price-asc") {
    sortObject.product_price = "asc";
  }

  let limit = 3;
  if (req.query.limit) {
    limit = let.query.limit;
  }

  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const offers = await Offer.find(filtersObject)
    .sort(sortObject)
    .skip((page - 1) * limit)
    .limit(limit)
    .select("product_name product_price");

  const count = await Offer.countDocuments(filtersObject);

  res.json({ count: count, offers: offers });
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone",
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
