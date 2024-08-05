const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    console.log('Verified user:', req.user);

    const profile = await Profile.findOne({ where: { userId: req.user.userid } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    req.profile = profile;
    next();
  } catch (err) {
    console.log('Invalid token:', err.message);
    res.status(400).json({ error: 'Invalid token' });
  }
};