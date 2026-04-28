const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, updateMe, createUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.post('/', protect, admin, createUser);
router.put('/profile', protect, updateMe);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
