const fileDb = require('../storage/fileDb');
const COLLECTION = 'notifications';

const normalizeStr = (val) => (typeof val === 'string' ? val.trim() : val);

exports.getNotifications = async (req, res) => {
  try {
    let rows = fileDb.readCollection(COLLECTION);
    
    // Admin gets all notifications addressed to 'admin' OR their own ID
    // User gets only notifications addressed to their ID
    const userId = req.user._id;
    const role = req.user.role;

    const myNotifications = rows.filter(n => {
      if ((role === 'admin' || role === 'team_leader') && n.recipient === 'admin') return true;
      return n.recipient === userId;
    });

    // sort by latest first
    myNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(myNotifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    let rows = fileDb.readCollection(COLLECTION);
    const userId = req.user._id;
    const role = req.user.role;

    const myUnread = rows.filter(n => {
      if (n.isRead) return false;
      if ((role === 'admin' || role === 'team_leader') && n.recipient === 'admin') return true;
      return n.recipient === userId;
    });

    res.json({ count: myUnread.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = fileDb.findById(COLLECTION, req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const updated = fileDb.updateById(COLLECTION, req.params.id, { isRead: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const rows = fileDb.readCollection(COLLECTION);
    const userId = req.user._id;
    const role = req.user.role;

    let count = 0;
    rows.forEach(n => {
      const isMine = ((role === 'admin' || role === 'team_leader') && n.recipient === 'admin') || n.recipient === userId;
      if (isMine && !n.isRead) {
        fileDb.updateById(COLLECTION, n._id, { isRead: true });
        count++;
      }
    });

    res.json({ message: `Marked ${count} notifications as read`, count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.bulkMarkAsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of notification ids' });
    }

    let count = 0;
    ids.forEach(id => {
      const n = fileDb.findById(COLLECTION, id);
      if (n) {
        fileDb.updateById(COLLECTION, id, { isRead: true });
        count++;
      }
    });

    res.json({ message: `Marked ${count} notifications as read`, count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = fileDb.findById(COLLECTION, req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    fileDb.deleteById(COLLECTION, req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of notification ids' });
    }

    let count = 0;
    ids.forEach(id => {
      const n = fileDb.findById(COLLECTION, id);
      if (n) {
        fileDb.deleteById(COLLECTION, id);
        count++;
      }
    });

    res.json({ message: `Deleted ${count} notifications`, count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { recipient, title, message } = req.body;
    if (!recipient || !title || !message) {
      return res.status(400).json({ message: 'Please provide recipient, title, and message' });
    }

    const payload = {
      recipient, // user id, or 'admin'
      sender: req.user._id,
      title: normalizeStr(title),
      message: normalizeStr(message),
      isRead: false
    };

    const created = fileDb.create(COLLECTION, payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
