const jwt = require('jsonwebtoken');
const fileDb = require('../storage/fileDb');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = fileDb.findById('users', decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const adminOrTeamLeader = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'team_leader')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Admin or Team Leader access required.' });
  }
};

module.exports = { protect, admin, adminOrTeamLeader };
