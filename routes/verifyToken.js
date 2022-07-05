const jwt = require("jsonwebtoken");
const User = require("../models/User");
async function verifyTokenAndGetUser(req, res, next) {
  
  const token = req.headers.token.split(" ")[1];
 
  try {
    const userId = jwt.verify(token, process.env.JWT_SEC_HASH_PHRASE).userId;
    const user = await User.findById(userId);
    
    req.user = user;
    
    return next();
  } catch (e) {
 
    
    res.status(500).send({ errors: [{ msg: "internal server error" }] });
  }
}
module.exports = verifyTokenAndGetUser;
