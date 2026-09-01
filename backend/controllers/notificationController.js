const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const Chef = require('../models/Chef');

exports.createNotification = async (req, res) => {
    try {
        const { CustomerId, chefId } = req.body;

        const notification = await Notification.create({
            CustomerId,
            chefId
        });

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        let notifications;

        if (req.user.role === 'Customer') {
            const customer = await Customer.findOne({ userId: req.user._id });
            notifications = await Notification.find({ CustomerId: customer._id }).populate('chefId');
        } else if (req.user.role === 'Chef') {
            const chef = await Chef.findOne({ userId: req.user._id });
            notifications = await Notification.find({ chefId: chef._id }).populate('CustomerId');
        } else {
            notifications = await Notification.find().populate('CustomerId chefId');
        }

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};