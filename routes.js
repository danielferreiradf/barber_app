const { Router } = require('express');
const multer = require('multer');
const multerConfig = require('./config/multer');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');
const FileController = require('./app/controllers/FileController');
const ProviderController = require('./app/controllers/ProviderController');
const AppointmentController = require('./app/controllers/AppointmentController');
const ScheduleController = require('./app/controllers/ScheduleController');

// Middlewares
const authMiddleware = require('./app/middlewares/auth');

const routes = new Router();
const upload = multer(multerConfig);

// Users
routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);

// Sessions
routes.post('/sessions', SessionController.create);

// Providers
routes.get('/providers', authMiddleware, ProviderController.getAll);

// Appointments
routes.post('/appointments', authMiddleware, AppointmentController.create);
routes.get('/appointments', authMiddleware, AppointmentController.getAll);

// Schedule
routes.get('/schedule', authMiddleware, ScheduleController.getAll);

// Uploads
routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.create
);

module.exports = routes;
