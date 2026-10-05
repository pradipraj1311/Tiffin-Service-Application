const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id || req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id || req.user.id, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user._id || req.user.id });
        res.status(200).json({ message: 'All notifications cleared.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};