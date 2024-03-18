const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dokyaftrm",
  api_key: "353822867621548",
  api_secret: "zFx02Or9PKTXsZAz6VljSaWkTRQ",
});

module.exports = cloudinary;
