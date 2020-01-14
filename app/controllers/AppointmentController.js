const Yup = require('yup');
const { startOfHour, parseISO, isBefore, format } = require('date-fns');
const pt = require('date-fns/locale/pt');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const File = require('../models/File');
const Notification = require('../schemas/Notification');

class AppointmentController {
  async getAll(req, res) {
    const { page = 1 } = req.query;
    try {
      const appointments = await Appointment.findAll({
        where: { user_id: req.userId, canceled_at: null },
        order: ['date'],
        attributes: ['id', 'date'],
        limit: 20,
        offset: (page - 1) * 20,
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['id', 'name'],
            include: [
              { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
            ],
          },
        ],
      });

      return res.json(appointments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

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

      // Notify appointment provider

      const user = await User.findByPk(req.userId);
      const formattedDate = format(
        hourStart,
        "'dia' dd 'de' MMMM', às' H:mm'h'",
        { locale: pt }
      );

      await Notification.create({
        content: `Novo agendamento de ${user.name} para ${formattedDate} `,
        user: provider_id,
      });

      return res.json(appointment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();
