const fileDb = require('../storage/fileDb');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const users = fileDb.readCollection('users').map(u => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const existingUser = fileDb.findById('users', req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protect Admin Carl
    if (existingUser.username === 'Admin Carl') {
      return res.status(403).json({ message: 'System Administrator account cannot be modified via this module.' });
    }

    const { status, role, name, username, password } = req.body;
    const patch = {};
    if (status) patch.status = status;
    if (role) patch.role = role;
    if (name) patch.name = name;
    if (username) patch.username = username;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      patch.password = await bcrypt.hash(password, salt);
    }

    const user = fileDb.updateById('users', req.params.id, patch);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (status || role) {
      let msg = '';
      if (status) msg += `Your account status was updated to ${status}. `;
      if (role) msg += `Your role was updated to ${role}. `;
      fileDb.create('notifications', {
        recipient: user._id,
        sender: req.user._id,
        title: 'Account Update',
        message: msg.trim(),
        isRead: false
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const patch = {};
    if (name) patch.name = name;
    if (username) patch.username = username;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      patch.password = await bcrypt.hash(password, salt);
    }

    const user = fileDb.updateById('users', req.user._id, patch);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const existingUser = fileDb.findById('users', req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protect Admin Carl
    if (existingUser.username === 'Admin Carl') {
      return res.status(403).json({ message: 'System Administrator account cannot be deleted.' });
    }

    const user = fileDb.deleteById('users', req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { name, username, password, role, status } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const users = fileDb.readCollection('users');
    const userExists = users.find(u => u.username === username);
    if (userExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = fileDb.create('users', {
      name,
      username,
      password: hashedPassword,
      role: role || 'user',
      status: status || 'approved'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
