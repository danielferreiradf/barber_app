const User = require('../models/User');
const File = require('../models/File');

class ProviderController {
  async getAll(req, res) {
    try {
      const providers = await User.findAll({
        where: { provider: true },
        attributes: ['id', 'name', 'email', 'avatar_id'],
        include: [
          { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
        ],
      });

      return res.json(providers);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProviderController();
