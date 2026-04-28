const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  bulkMarkAsRead,
  deleteNotification,
  bulkDelete,
  sendNotification
} = require('../controllers/notificationController');
const { protect, admin, adminOrTeamLeader } = require('../middleware/authMiddleware');

router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/bulk-read', bulkMarkAsRead);
router.put('/:id/read', markAsRead);
router.delete('/bulk-delete', bulkDelete);
router.delete('/:id', deleteNotification);
router.post('/send', adminOrTeamLeader, sendNotification);

module.exports = router;
