const express = require('express');
const path = require('path');
const cors = require('cors');
const Sentry = require('@sentry/node');
const routes = require('./routes');

// Load dotenv files
require('dotenv').config({ path: './config/config.env' });

// Load database connection
require('./database');

class App {
  constructor() {
    this.server = express();

    Sentry.init({ dsn: process.env.SENTRY_DSN });

    this.middlewares();
    this.routes();
  }

  middlewares() {
    if (process.env.NODE_ENV === 'production') {
      this.server.use(Sentry.Handlers.requestHandler());
    }
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, 'temp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);

    if (process.env.NODE_ENV === 'production') {
      this.server.use(Sentry.Handlers.errorHandler());
    }
  }
}

module.exports = new App().server;
