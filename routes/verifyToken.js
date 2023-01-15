const jwt = require("jsonwebtoken");
const User = require("../models/User");
async function verifyTokenAndGetUser(req, res, next) {
  try {
    const token = req.headers.token.split(" ")[1];
    const userId = jwt.verify(token, process.env.JWT_SEC_HASH_PHRASE).id;
    const user = await User.findById(userId);
    req.user = user;
    return next();
  } catch  { 
    res.status(401).send({ errors: [{ msg: "token unverified" }] });
  }
}
module.exports = verifyTokenAndGetUser;
