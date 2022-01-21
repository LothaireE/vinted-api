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
  try {
    // const offer = await User.findOne
    const title = req.query.title;
    const price_min = req.query.priceMin;
    const price_max = req.query.priceMax;
    const page = req.query.page;

    // const filters = {};

    // filters.product_name = title;
    // filters.product_price = { $gte: price_min, $lte: price_max };

    // console.log(filters);

    // const offers = await Offer.find(filters).limit(3).sort("desc");
    // const offers = await Offer.find({
    //   product_price: { $gte: price_min, $lte: price_max },
    // })

    //   .sort({ product_price: "desc" })
    //   .limit(req.query.limit)
    //   .skip(2)
    //   .select("product_name product_price");

    // console.log(offers);
    // newPage = req.query.page;
    // const page = await Offer.find().select(
    //   "product_name product_detail product"
    // );
    // .select(
    //   "product_name product_details "
    // );
    // const offer = await Offer.findOne({
    //   token: req.headers.authorization.replace("Bearer ", ""),
    // console.log("====>", page);
    const offers = await Offer.find();
    res.status(200).json({
      offers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
