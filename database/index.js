const Sequelize = require('sequelize');

const User = require('../app/models/User');
const File = require('../app/models/File');

const databaseConfig = require('../config/database');

const models = [User, File];

class DataBase {
  constructor() {
    this.init();
  }

  // connection receives sequelize config e loops over models array
  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

module.exports = new DataBase();
