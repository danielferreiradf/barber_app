const Yup = require('yup');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

class AppointmentController {
  async create(req, res) {
    try {
      const schema = Yup.object().shape({
        provider_id: Yup.number().required(),
        date: Yup.date().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation failed.' });
      }

      const { provider_id, date } = req.body;

      // Check if provider_id is a provider in database
      const isProvider = await User.findOne({
        where: {
          id: provider_id,
          provider: true,
        },
      });

      if (!isProvider) {
        return res
          .status(401)
          .json({ error: 'Appointments can only be created by providers.' });
      }

      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date,
      });

      return res.json(appointment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();
