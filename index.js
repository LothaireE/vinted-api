require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors()); //autorise les autres site à faire appel a mon api

// mongoose.connect("mongodb://localhost/vinted");
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.json("ça marche");
});

const usersRoutes = require("./routes/users");
app.use(usersRoutes);

const offersRoutes = require("./routes/offers");
const req = require("express/lib/request");
app.use(offersRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server has started!!");
});
