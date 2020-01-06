const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  // This method receives sequelize connection as parameter
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
  }
}

module.exports = User;
