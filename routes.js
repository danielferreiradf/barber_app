const { Router } = require('express');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');

const routes = new Router();

routes.post('/users', UserController.create);
routes.post('/sessions', SessionController.create);

module.exports = routes;
