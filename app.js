const express = require('express');
const path = require('path');
const routes = require('./routes');

// Load dotenv files
require('dotenv').config({ path: './config/config.env' });

// Load database connection
require('./database');

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, 'temp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

module.exports = new App().server;
