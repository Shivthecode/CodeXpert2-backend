const jwt = require('jsonwebtoken');

const fetchuser = (req, res, next) => {
  // 1. Frontend se aane wale token ko header se nikalna
  const token = req.header('Authorization')?.split(' ')[1] || req.header('auth-token');

  // 2. Agar token nahi mila toh yahin se wapas bhej do
  if (!token) {
    return res.status(401).json({ message: "Access Denied! Aap login nahi hain." });
  }

  try {
    // 3. Token ko apni JWT_SECRET key se verify karna
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Token se user ka data nikal kar 'req.user' mein daal dena
    req.user = verified; // Is line se tumhare teamController ko leader ki ID milegi
    
    next(); // 5. Sab theek hai toh aage controller ke paas jane do
  } catch (error) {
    res.status(400).json({ message: "Invalid Token!" });
  }
};

module.exports = fetchuser;