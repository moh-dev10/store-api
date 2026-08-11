const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  if(!authHeader){
    return res.status(401).json(
        {
            message:"Authorization header is required"
        }
    );
  }

  const token = authHeader.split(" ")[1];

  try{
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );
    req.user = decoded;

    next();
  } catch(error) {
    return res.status(401).json({
        message:"Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;