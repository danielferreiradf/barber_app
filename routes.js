const { Router } = require('express');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');

const authMiddleware = require('./app/middlewares/auth');

const routes = new Router();

// Users
routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);

// Sessions
routes.post('/sessions', SessionController.create);

module.exports = routes;
