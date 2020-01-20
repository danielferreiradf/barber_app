const jwt = require('jsonwebtoken');
const Yup = require('yup');
const User = require('../models/User');
const File = require('../models/File');

class SessionController {
  async create(req, res) {
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email()
          .required(),
        password: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation failed.' });
      }

      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }

      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const { id, name, avatar, provider } = user;

      return res.json({
        user: {
          id,
          name,
          email,
          provider,
          avatar,
        },
        token: jwt.sign({ id }, process.env.JWT_CODE, {
          expiresIn: process.env.JWT_EXPI,
        }),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SessionController();
