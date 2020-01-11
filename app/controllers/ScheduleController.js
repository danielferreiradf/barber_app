const { startOfDay, endOfDay, parseISO } = require('date-fns');
const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

class ScheduleController {
  async getAll(req, res) {
    try {
      // Checks if logged user is a provider
      const isProvider = await User.findOne({
        where: { id: req.userId, provider: true },
      });

      if (!isProvider) {
        return res.status(401).json({ error: 'User is not a provider.' });
      }

      //   Gets date from query
      const { date } = req.query;

      // Parses date to javaScript date
      const parsedDate = parseISO(date);

      const appointments = await Appointment.findAll({
        where: {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        ],
        order: ['date'],
      });

      return res.json(appointments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ScheduleController();
