const User = require('../models/User');

class UserController {
  async create(req, res) {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (user) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }
}

module.exports = new UserController();
