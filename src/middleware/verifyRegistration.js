const User = require("../models/user");
const Role = require("../models/role");

checkDuplicateEmail = async (req, res, next) => {
  console.log(req.body.email);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .send({ message: "Failed! Email is already in use!" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

checkDuplicateMobile = async (req, res, next) => {
  console.log(req.body.mobile);
  try {
    const user = await User.findOne({ mobile: req.body.mobile });
    if (user) {
      return res
        .status(400)
        .send({ message: "Failed! Mobile is already in use!" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const verifyRegistration = {
  checkDuplicateEmail,
  checkDuplicateMobile,
};

module.exports = verifyRegistration;
