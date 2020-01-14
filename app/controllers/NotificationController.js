const Notification = require('../schemas/Notification');
const User = require('../models/User');

class NotificationController {
  async getAll(req, res) {
    try {
      // Checks if provider_id is a provider in database
      const isProvider = await User.findOne({
        where: {
          id: req.userId,
          provider: true,
        },
      });

      if (!isProvider) {
        return res
          .status(401)
          .json({ error: 'Notifications can only be seen by providers.' });
      }

      const notifications = await Notification.find({
        user: req.userId,
      })
        .sort('-createdAt')
        .limit(20);

      return res.json(notifications);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.notification_id,
        {
          read: true,
        },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ error: 'Notification does not exist.' });
      }

      return res.json(notification);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new NotificationController();
