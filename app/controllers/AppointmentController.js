const Yup = require('yup');
const {
  startOfHour,
  parseISO,
  isBefore,
  format,
  subHours,
} = require('date-fns');
const pt = require('date-fns/locale/pt');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const File = require('../models/File');
const Notification = require('../schemas/Notification');
const Mail = require('../../lib/Mail');

class AppointmentController {
  async getAll(req, res) {
    try {
      const { page = 1 } = req.query;
      const appointments = await Appointment.findAll({
        where: { user_id: req.userId, canceled_at: null },
        order: ['date'],
        attributes: ['id', 'date', 'past', 'cancelable'],
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
          .json({ error: 'Appointments can only be made for providers.' });
      }

      // Checks if userId and provider_id are the same
      if (req.userId === provider_id) {
        return res
          .status(401)
          .json({ error: 'User and provider cannot be equal.' });
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

  async delete(req, res) {
    try {
      const appointment = await Appointment.findByPk(
        req.params.appointment_id,
        {
          include: [
            { model: User, as: 'provider', attributes: ['name', 'email'] },
            { model: User, as: 'user', attributes: ['name'] },
          ],
        }
      );

      // Checks if appointment user owner is the same as logged user
      if (appointment.user_id !== req.userId) {
        return res.status(401).json({
          error: 'User does not have permission to delete this appointment.',
        });
      }

      // Users can only cancel appointment if it is at least 2 hours in advance
      // Subtracks 2 hours from appointment date
      const dateWithSub = subHours(appointment.date, 2);

      // Checks if subtracted date is at least 2 hours before current date
      if (isBefore(dateWithSub, new Date())) {
        return res.status(401).json({
          error: 'You can only cancel appointments 2 hours in advance',
        });
      }

      appointment.canceled_at = new Date();
      await appointment.save();

      await Mail.sendMail({
        to: `${appointment.provider.name} <${appointment.provider.email}>`,
        subject: 'BarberApp - Agendamento cancelado',
        template: 'cancellation',
        context: {
          provider: appointment.provider.name,
          user: appointment.user.name,
          date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
            locale: pt,
          }),
        },
      });

      return res.json(appointment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();
