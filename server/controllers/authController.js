const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fileDb = require('../storage/fileDb');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const users = fileDb.readCollection('users');
    const userExists = users.find(u => u.username === username);
    if (userExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If it's the very first user, make them admin and auto-approve
    const isFirstAccount = users.length === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    const status = isFirstAccount ? 'approved' : 'pending';

    const user = fileDb.create('users', {
      name,
      username,
      password: hashedPassword,
      role,
      status
    });

    if (user) {
      if (status === 'pending') {
        fileDb.create('notifications', {
          recipient: 'admin',
          sender: user._id,
          title: 'New User Registration',
          message: `${name} (${username}) has registered and is pending approval.`,
          isRead: false
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = fileDb.readCollection('users');
    const user = users.find(u => u.username === username);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if approved
      if (user.status !== 'approved' && user.role !== 'admin' && user.role !== 'team_leader') {
        return res.status(401).json({ message: 'Account is pending approval or inactive' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    username: req.user.username,
    role: req.user.role,
    status: req.user.status
  });
};
