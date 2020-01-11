const File = require('../models/File');

class FileController {
  async create(req, res) {
    try {
      const { originalname: name, filename: path } = req.file;

      const file = await File.create({
        name,
        path,
      });

      return res.json(file);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FileController();
