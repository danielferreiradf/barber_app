const Sequelize = require('sequelize');

class File extends Sequelize.Model {
  // This method receives sequelize connection as parameter
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

module.exports = File;
