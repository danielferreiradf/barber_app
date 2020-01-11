const Yup = require('yup');
const { startOfHour, parseISO, isBefore } = require('date-fns');
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

      // Checks if provider_id is a provider in database
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

      // Converts "date" into a javaScript Date
      const hourStart = startOfHour(parseISO(date));

      // Checks if given date is before current time
      if (isBefore(hourStart, new Date())) {
        return res.status(400).json({ error: 'Past date is not allowed.' });
      }

      // Checks if provider already has an appointment at given time
      const appointmentTaken = await Appointment.findOne({
        where: {
          provider_id,
          canceled_at: null,
          date: hourStart,
        },
      });

      if (appointmentTaken) {
        return res
          .status(400)
          .json({ error: 'Appointment date is not available.' });
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
