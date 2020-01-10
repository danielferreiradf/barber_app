const { Router } = require('express');
const multer = require('multer');
const multerConfig = require('./config/multer');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');
const FileController = require('./app/controllers/FileController');

const authMiddleware = require('./app/middlewares/auth');

const routes = new Router();
const upload = multer(multerConfig);

// Users
routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);

// Sessions
routes.post('/sessions', SessionController.create);

// Uploads
routes.post('/files', upload.single('file'), FileController.create);

module.exports = routes;
